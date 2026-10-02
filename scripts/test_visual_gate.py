"""Run with python3 scripts/test_visual_gate.py; Docker and network are not needed."""

import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import time
import unittest


SCRIPTS = Path(__file__).resolve().parent


class VisualGateTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "worktree"
        self.root.mkdir()
        self.remote = Path(self.temp.name) / "origin.git"
        self.run_command("git", "init", "--bare", str(self.remote))
        self.git("init", "-b", "main")
        self.git("config", "user.name", "Gate Test")
        self.git("config", "user.email", "gate@example.invalid")
        self.git("remote", "add", "origin", str(self.remote))
        (self.root / "scripts").mkdir()
        for name in ("check-visual.sh", "push.sh"):
            shutil.copy2(SCRIPTS / name, self.root / "scripts" / name)
        compose = self.root / ".codex/skills/masusono-worktree/scripts/compose.sh"
        compose.parent.mkdir(parents=True)
        compose.write_text(
            '#!/usr/bin/env bash\n'
            'printf "%s\\n" "$*" >> "$GATE_LOG"\n'
            'if [[ "$*" == *" up "* ]]; then exit "${GATE_UP_RESULT:-0}"; fi\n'
            'if [[ "$*" == *" stop "* ]]; then exit "${GATE_STOP_RESULT:-0}"; fi\n'
            'if [[ "$*" == *" run "* ]]; then\n'
            '  if [[ "${GATE_WAIT:-0}" == 1 ]]; then\n'
            '    sleep 60 &\n'
            '    sleep_pid=$!\n'
            '    trap \'kill "$sleep_pid" 2>/dev/null; wait "$sleep_pid" 2>/dev/null; exit 143\' TERM\n'
            '    touch "$GATE_READY"\n'
            '    wait "$sleep_pid"\n'
            '  fi\n'
            '  exit "${GATE_RESULT:-0}"\n'
            'fi\n'
        )
        compose.chmod(0o755)
        self.commit()
        self.git("push", "origin", "main")
        self.git("checkout", "-b", "task")
        self.log = Path(self.temp.name) / "compose.log"
        self.env = {**os.environ, "GATE_LOG": str(self.log)}

    def run_command(self, *args, **kwargs):
        return subprocess.run(
            args, cwd=self.root, text=True, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, check=kwargs.pop("check", True), **kwargs,
        )

    def git(self, *args):
        return self.run_command("git", *args).stdout.strip()

    def commit(self):
        self.git("add", ".")
        self.git("commit", "-m", "fixture")

    def change(self, path):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("changed\n")
        self.commit()

    def push(self, *args, result=0):
        return self.run_command(
            "bash", "scripts/push.sh", *args, check=False,
            env={**self.env, "GATE_RESULT": str(result)},
        )

    def remote_task(self):
        return self.git("ls-remote", "origin", "refs/heads/task")

    def test_full_comparison_runs_before_visual_push(self):
        self.change("backend/app/frontend/Card.jsx")
        self.assertEqual(self.push().returncode, 0)
        calls = self.log.read_text().splitlines()
        self.assertEqual(len(calls), 3)
        self.assertIn("up --build -d backend vite", calls[0])
        self.assertTrue(calls[1].endswith("run --build --rm visual npm run test:visual"))
        self.assertEqual(calls[2], "-f backend/compose.visual.yml stop --timeout 10 backend vite")
        self.assertTrue(self.remote_task())

    def check_visual(self, **env):
        return self.run_command(
            "bash", "scripts/check-visual.sh", check=False,
            env={**self.env, **env},
        )

    def assert_servers_stopped(self):
        self.assertEqual(
            self.log.read_text().splitlines()[-1],
            "-f backend/compose.visual.yml stop --timeout 10 backend vite",
        )

    def test_comparison_failure_stops_servers_and_preserves_status(self):
        self.assertEqual(self.check_visual(GATE_RESULT="7").returncode, 7)
        self.assert_servers_stopped()

    def test_partial_startup_failure_also_stops_servers(self):
        self.assertEqual(self.check_visual(GATE_UP_RESULT="8").returncode, 8)
        calls = self.log.read_text().splitlines()
        self.assertEqual(len(calls), 2)
        self.assert_servers_stopped()

    def test_stop_failure_is_reported_without_hiding_test_failure(self):
        for test_result, expected in (("0", 9), ("7", 7)):
            with self.subTest(test_result=test_result):
                command = self.check_visual(GATE_RESULT=test_result, GATE_STOP_RESULT="9")
                self.assertEqual(command.returncode, expected)
                self.assertIn("Failed to stop", command.stderr)
                self.assert_servers_stopped()

    def test_stop_failure_blocks_push(self):
        self.change("backend/app/frontend/Card.jsx")
        command = self.run_command(
            "bash", "scripts/push.sh", check=False,
            env={**self.env, "GATE_STOP_RESULT": "9"},
        )
        self.assertEqual(command.returncode, 9)
        self.assertFalse(self.remote_task())

    def test_interruption_stops_servers(self):
        for interrupt, expected in ((signal.SIGINT, 130), (signal.SIGTERM, 143)):
            with self.subTest(interrupt=interrupt):
                ready = Path(self.temp.name) / "ready"
                ready.unlink(missing_ok=True)
                process = subprocess.Popen(
                    ["bash", "scripts/check-visual.sh"], cwd=self.root,
                    env={**self.env, "GATE_WAIT": "1", "GATE_READY": str(ready)},
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                    start_new_session=True,
                )
                try:
                    deadline = time.monotonic() + 5
                    while not ready.exists() and time.monotonic() < deadline and process.poll() is None:
                        time.sleep(0.01)
                    self.assertTrue(ready.exists(), "Mock comparison did not start")
                    os.kill(process.pid, interrupt)
                    process.communicate(timeout=5)
                    self.assertEqual(process.returncode, expected)
                    self.assert_servers_stopped()
                finally:
                    if process.poll() is None:
                        os.killpg(process.pid, signal.SIGKILL)
                        process.communicate()

    def test_failed_comparison_blocks_initial_and_subsequent_push(self):
        self.change("backend/test/visual/example.png")
        self.assertEqual(self.push(result=7).returncode, 7)
        self.assertFalse(self.remote_task())
        self.assertEqual(self.push().returncode, 0)
        pushed = self.remote_task()
        self.change("backend/app/views/example.html.erb")
        self.assertEqual(self.push(result=7).returncode, 7)
        self.assertEqual(self.remote_task(), pushed)

    def test_documentation_only_push_skips_visual_check(self):
        self.change("README.md")
        self.assertEqual(self.push().returncode, 0)
        self.assertFalse(self.log.exists())
        self.assertTrue(self.remote_task())

    def test_page_data_and_visual_configuration_also_trigger_comparison(self):
        for path in (
            "backend/app/controllers/home_controller.rb",
            "backend/config/routes.rb", "backend/vite.config.ts",
            "backend/playwright.config.js", "backend/package-lock.json",
            "backend/compose.visual.yml", "backend/Dockerfile.visual",
        ):
            with self.subTest(path=path):
                self.change(path)
                self.assertEqual(self.push(result=7).returncode, 7)
                self.assertFalse(self.remote_task())
                # Start the next case from a base containing this change so that
                # an earlier matching path cannot hide a missing trigger.
                self.git("update-ref", "refs/remotes/origin/main", "HEAD")

    def test_dirty_tracked_files_block_push(self):
        (self.root / "scripts/push.sh").write_text(
            (self.root / "scripts/push.sh").read_text() + "\n# dirty\n"
        )
        self.assertNotEqual(self.push().returncode, 0)
        self.assertFalse(self.remote_task())

    def test_filters_updates_and_other_push_targets_are_rejected(self):
        for args in (("--grep", "home"), ("--update-snapshots",), ("--project=mobile",)):
            with self.subTest(args=args):
                command = self.run_command(
                    "bash", "scripts/check-visual.sh", *args,
                    check=False, env=self.env,
                )
                self.assertNotEqual(command.returncode, 0)
                self.assertFalse(self.log.exists())
        self.assertNotEqual(self.push("origin", "other").returncode, 0)
        self.assertFalse(self.remote_task())

    def test_missing_base_blocks_push(self):
        self.git("update-ref", "-d", "refs/remotes/origin/main")
        self.assertNotEqual(self.push().returncode, 0)
        self.assertFalse(self.remote_task())


if __name__ == "__main__":
    unittest.main()
