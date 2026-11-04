"""Run with python3 scripts/test_deploy.py; all cloud commands are faked."""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


DEPLOY = Path(__file__).resolve().parents[1] / "deploy.sh"


class DeployTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.calls = self.root / "calls"
        self.output = self.root / "output"
        fake = self.root / "gcloud"
        fake.write_text(
            "#!/usr/bin/env python3\n"
            "import json, os, sys\n"
            "with open(os.environ['TEST_CALLS'], 'a') as f:\n"
            "    f.write(json.dumps(sys.argv[1:]) + '\\n')\n"
            "print(os.environ.get('TEST_CLOUD_MESSAGE', ''))\n"
            "sys.exit(int(os.environ.get('TEST_CLOUD_STATUS', '0')))\n"
        )
        fake.chmod(0o755)
        git = self.root / "git"
        git.write_text("#!/bin/sh\nexit 0\n")
        git.chmod(0o755)
        self.env = {
            "PATH": f"{self.root}:{os.environ['PATH']}",
            "DEPLOY_BRANCH": "feature/example",
            "GITHUB_OUTPUT": str(self.output),
            "TEST_CALLS": str(self.calls),
        }

    def run_deploy(self, command="service-name", **env):
        return subprocess.run(
            ["bash", str(DEPLOY), command], env=self.env | env,
            text=True, capture_output=True, check=False,
        )

    def cloud_calls(self):
        return [json.loads(line) for line in self.calls.read_text().splitlines()] if self.calls.exists() else []

    def service_name(self, branch):
        result = self.run_deploy(DEPLOY_BRANCH=branch)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.splitlines()[0].split(": ", 1)[1]

    def test_production_name_and_output_without_cloud_call(self):
        self.assertEqual(self.service_name("main"), "masusono")
        self.assertEqual(self.output.read_text(), "service_name=masusono\nimage_package=production\n")
        self.assertEqual(self.cloud_calls(), [])

    def test_normalized_branches_remain_distinct(self):
        names = [self.service_name(branch) for branch in ("feature/foo", "feature-foo", "Feature/Foo")]
        self.assertEqual(len(set(names)), 3)

    def test_long_name_is_valid_stable_and_distinct(self):
        branch = "feature/" + "a" * 100
        name = self.service_name(branch)
        self.assertLessEqual(len(name), 63)
        self.assertRegex(name, r"^[a-z][a-z0-9-]*[a-z0-9]$")
        self.assertEqual(name, self.service_name(branch))
        self.assertNotEqual(name, self.service_name(branch + "b"))

    def test_invalid_inputs_never_call_cloud(self):
        for command, env in (("unknown", {}), ("delete", {"DEPLOY_BRANCH": "main"}),
                             ("deploy", {"DEPLOY_BRANCH": "!!!"}), ("deploy", {"DEPLOY_BRANCH": ""})):
            with self.subTest(command=command, env=env):
                self.assertNotEqual(self.run_deploy(command, **env).returncode, 0)
        self.assertEqual(self.cloud_calls(), [])

    def test_missing_service_delete_is_idempotent(self):
        for message in ("NOT_FOUND", "not found", "could not be found"):
            with self.subTest(message=message):
                result = self.run_deploy("delete", TEST_CLOUD_STATUS="1", TEST_CLOUD_MESSAGE=message)
                self.assertEqual(result.returncode, 0, result.stderr)
        call = self.cloud_calls()[0]
        self.assertEqual(call[:3], ["run", "services", "delete"])
        self.assertIn("--quiet", call)

    def test_permission_failure_is_not_treated_as_missing(self):
        result = self.run_deploy("delete", TEST_CLOUD_STATUS="1", TEST_CLOUD_MESSAGE="PERMISSION_DENIED")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("PERMISSION_DENIED", result.stderr)
        self.assertFalse(self.output.exists())

    def test_deploy_source_and_image_with_production_only_analytics(self):
        for branch, image in (("main", ""), ("feature/example", "registry.example/image:sha")):
            with self.subTest(branch=branch):
                result = self.run_deploy("deploy", DEPLOY_BRANCH=branch, IMAGE_URI=image)
                self.assertEqual(result.returncode, 0, result.stderr)
                call = self.cloud_calls()[-1]
                self.assertEqual(call[:2], ["run", "deploy"])
                self.assertIn("--image" if image else "--source", call)
                self.assertNotIn("--source" if image else "--image", call)
                self.assertIn(image or ".", call)
                self.assertIn("GA4_MEASUREMENT_ID=" + ("G-5930S30RWS" if branch == "main" else ""), call)
                self.assertIn("RAILS_MASTER_KEY=rails-master-key:latest", call)
                self.assertIn("--remove-env-vars", call)
                self.assertIn(".asia-northeast1.run.app", self.output.read_text())

    def test_failed_deploy_does_not_publish_success_outputs(self):
        result = self.run_deploy("deploy", TEST_CLOUD_STATUS="1", TEST_CLOUD_MESSAGE="build failed")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("デプロイ完了", result.stdout)
        self.assertFalse(self.output.exists())


if __name__ == "__main__":
    unittest.main()
