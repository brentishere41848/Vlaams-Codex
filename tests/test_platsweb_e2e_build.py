from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def test_e2e_build_examples_hello_web(tmp_path: Path) -> None:
    repo = Path(__file__).resolve().parents[1]
    src_dir = repo / "examples" / "hello-web"
    work = tmp_path / "hello-web"
    work.mkdir(parents=True)

    # Copy example fixture into temp dir to keep repo clean.
    (work / "page.plats").write_text((src_dir / "page.plats").read_text(encoding="utf-8"), encoding="utf-8")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(repo / "src")

    subprocess.run(
        [sys.executable, "-m", "vlaamscodex.cli", "build", str(work)],
        check=True,
        env=env,
        cwd=str(repo),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    dist = work / "dist"
    assert (dist / "index.plats").exists()
    assert (dist / "page.plats").exists()
    assert (dist / "vercel.json").exists()
    assert (dist / "_headers").exists()
    assert (dist / "_redirects").exists()
    assert (dist / ".htaccess").exists()

    plats_html = (dist / "index.plats").read_text(encoding="utf-8")

    assert "plats-root" in plats_html
    assert "<style>" in plats_html
    assert "<script>" in plats_html
