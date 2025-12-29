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
    assert (dist / "index.html").exists()
    assert (dist / "app.js").exists()
    assert (dist / "app.css").exists()
    assert (dist / "index.plats").exists()

    html = (dist / "index.html").read_text(encoding="utf-8")
    js = (dist / "app.js").read_text(encoding="utf-8")
    css = (dist / "app.css").read_text(encoding="utf-8")
    plats_html = (dist / "index.plats").read_text(encoding="utf-8")

    assert "plats-root" in html
    assert "render" in js
    assert "body" in css
    assert "<style>" in plats_html
    assert "<script>" in plats_html
