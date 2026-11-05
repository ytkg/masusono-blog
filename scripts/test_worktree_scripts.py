"""Run with python3 scripts/test_worktree_scripts.py; no Docker or network is used."""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT_ROOT = Path(__file__).resolve().parents[1] / ".codex/skills/masusono-worktree/scripts"


class ScriptTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name) / "primary checkout"
        self.root.mkdir()
        self.tools = Path(temporary.name) / "tools"
        self.tools.mkdir()
        self.env = {
            **os.environ,
            "PATH": f"{self.tools}{os.pathsep}{os.environ['PATH']}",
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_TERMINAL_PROMPT": "0",
        }

    def command(self, *args, cwd=None, **env):
        return subprocess.run(
            args, cwd=cwd or self.root, env={**self.env, **env},
            text=True, capture_output=True, timeout=30,
        )

    def tool(self, name, source):
        path = self.tools / name
        path.write_text(source)
        path.chmod(0o755)


class CreateWorktreeTest(ScriptTest):
    def setUp(self):
        super().setUp()
        self.remote = self.root.parent / "origin.git"
        self.git("init", "--bare", "--initial-branch=main", str(self.remote))
        self.git("init", "-b", "main")
        self.git("config", "user.name", "Worktree Test")
        self.git("config", "user.email", "worktree@example.invalid")
        (self.root / "seed").write_text("fixture")
        self.git("add", "seed")
        self.git("commit", "-m", "fixture")
        self.git("remote", "add", "origin", str(self.remote))
        self.git("push", "origin", "main")
        self.tool("lsof", '#!/usr/bin/env bash\nexit "${TEST_PORT_BUSY:-1}"\n')

    def git(self, *args):
        result = self.command("git", *args)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def create(self, *args, **options):
        return self.command("bash", str(SCRIPT_ROOT / "create-worktree.sh"), *args, **options)

    def settings(self, slug):
        path = self.root / ".worktrees" / slug / ".env.worktree"
        return dict(line.split("=", 1) for line in path.read_text().splitlines() if not line.startswith("#"))

    def test_invalid_slugs_are_rejected_before_creating_anything(self):
        for slug in ("", "../escape", "Uppercase", "with space", "-option", "nested/task"):
            with self.subTest(slug=slug):
                result = self.create(slug)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Usage:", result.stderr)
                self.assertFalse((self.root / ".worktrees").exists())

    def test_default_base_and_settings_use_the_primary_checkout(self):
        result = self.create("first-task")
        self.assertEqual(result.returncode, 0, result.stderr)
        target = self.root / ".worktrees/first-task"
        self.assertEqual(self.git("-C", str(target), "branch", "--show-current"), "codex/first-task")
        self.assertEqual(self.git("-C", str(target), "rev-parse", "HEAD"), self.git("rev-parse", "origin/main"))
        settings = self.settings("first-task")
        self.assertEqual(settings["COMPOSE_PROJECT_NAME"], "masusono-first-task")
        self.assertTrue(3100 <= int(settings["BACKEND_PORT"]) < 3900)
        self.assertTrue(4100 <= int(settings["VITE_PORT"]) < 4900)

    def test_existing_path_is_not_overwritten(self):
        target = self.root / ".worktrees/existing"
        target.mkdir(parents=True)
        sentinel = target / ".env.worktree"
        sentinel.write_text("preserve this")
        result = self.create("existing")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(sentinel.read_text(), "preserve this")
        self.assertEqual(self.git("branch", "--list", "codex/existing"), "")

    def test_existing_branch_is_not_reset(self):
        self.git("branch", "codex/existing")
        original = self.git("rev-parse", "codex/existing")
        self.assertNotEqual(self.create("existing").returncode, 0)
        self.assertEqual(self.git("rev-parse", "codex/existing"), original)
        self.assertFalse((self.root / ".worktrees/existing").exists())

    def test_fetch_failure_does_not_create_a_branch_or_checkout(self):
        self.git("remote", "set-url", "origin", str(self.root / "missing-remote"))
        self.assertNotEqual(self.create("no-fetch").returncode, 0)
        self.assertEqual(self.git("branch", "--list", "codex/no-fetch"), "")
        self.assertFalse((self.root / ".worktrees/no-fetch").exists())

    def test_missing_base_does_not_create_a_branch_or_checkout(self):
        self.assertNotEqual(self.create("no-base", "missing-ref").returncode, 0)
        self.assertEqual(self.git("branch", "--list", "codex/no-base"), "")
        self.assertFalse((self.root / ".worktrees/no-base").exists())

    def test_explicit_base_and_nested_invocation_still_use_primary_root(self):
        self.git("checkout", "-b", "parent")
        (self.root / "seed").write_text("parent revision")
        self.git("commit", "-am", "parent")
        parent = self.git("rev-parse", "HEAD")
        self.git("checkout", "main")
        self.assertEqual(self.create("first-task").returncode, 0)
        result = self.create("second-task", "parent", cwd=self.root / ".worktrees/first-task")
        self.assertEqual(result.returncode, 0, result.stderr)
        target = self.root / ".worktrees/second-task"
        self.assertEqual(self.git("-C", str(target), "rev-parse", "HEAD"), parent)
        self.assertFalse((self.root / ".worktrees/first-task/.worktrees").exists())

    def test_reserved_ports_from_other_environments_are_skipped(self):
        slug = "port-test"
        # Use the same platform checksum rather than assuming GNU/BSD output values.
        checksum = int(subprocess.run(
            ["cksum"], input=slug, text=True, capture_output=True, check=True,
        ).stdout.split()[0])
        backend, vite = 3100 + checksum % 800, 4100 + checksum % 800
        reserved = self.root / ".worktrees/reserved"
        reserved.mkdir(parents=True)
        (reserved / ".env.worktree").write_text(f"BACKEND_PORT={backend}\nVITE_PORT={vite}\n")
        result = self.create(slug)
        self.assertEqual(result.returncode, 0, result.stderr)
        settings = self.settings(slug)
        self.assertEqual(int(settings["BACKEND_PORT"]), backend + 1)
        self.assertEqual(int(settings["VITE_PORT"]), vite + 1)

    def test_listening_ports_are_not_assigned(self):
        result = self.create("busy-ports", TEST_PORT_BUSY="0")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unable to reserve a port", result.stderr)
        self.assertFalse((self.root / ".worktrees/busy-ports/.env.worktree").exists())


class ComposeWrapperTest(ScriptTest):
    def setUp(self):
        super().setUp()
        self.log = self.root / "docker.json"
        self.env["TEST_DOCKER_LOG"] = str(self.log)
        self.tool("docker", '''#!/usr/bin/env python3
import json, os, sys
from pathlib import Path
Path(os.environ["TEST_DOCKER_LOG"]).write_text(json.dumps({
    "args": sys.argv[1:],
    "project": os.environ.get("COMPOSE_PROJECT_NAME"),
    "backend": os.environ.get("BACKEND_PORT"),
    "vite": os.environ.get("VITE_PORT"),
}))
sys.exit(int(os.environ.get("TEST_DOCKER_RESULT", "0")))
''')

    def compose(self, *args, **env):
        return self.command("bash", str(SCRIPT_ROOT / "compose.sh"), *args, **env)

    def test_missing_environment_does_not_invoke_docker(self):
        self.assertNotEqual(self.compose("up").returncode, 0)
        self.assertFalse(self.log.exists())

    def test_environment_and_arguments_are_forwarded_without_splitting(self):
        (self.root / ".env.worktree").write_text(
            "COMPOSE_PROJECT_NAME=test-project\nBACKEND_PORT=3101\nVITE_PORT=4101\n"
        )
        result = self.compose("run", "--rm", "vite", "sh", "-c", "printf 'a b'")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(self.log.read_text()), {
            "args": ["compose", "-f", "compose.yml", "run", "--rm", "vite", "sh", "-c", "printf 'a b'"],
            "project": "test-project", "backend": "3101", "vite": "4101",
        })

    def test_docker_failure_exit_status_is_preserved(self):
        (self.root / ".env.worktree").write_text("COMPOSE_PROJECT_NAME=test-project\n")
        self.assertEqual(self.compose("up", TEST_DOCKER_RESULT="17").returncode, 17)


if __name__ == "__main__":
    unittest.main()
