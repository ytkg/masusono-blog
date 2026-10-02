"""Run with python3 scripts/test_visual_gate.py; Docker and network are not needed."""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
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
            'if [[ "$*" == *" run "* ]]; then exit "${GATE_RESULT:-0}"; fi\n'
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
        self.assertEqual(len(calls), 2)
        self.assertIn("up --build -d backend vite", calls[0])
        self.assertTrue(calls[1].endswith("run --build --rm visual npm run test:visual"))
        self.assertTrue(self.remote_task())

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
