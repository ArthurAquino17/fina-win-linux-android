from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ENTRYPOINT = ROOT / "server.py"
PUBLIC_DIR = ROOT / "public"
DATA_FILES = [
    "index.html",
    "styles.css",
    "app.js",
    "manifest.json",
    "sw.js",
    "icon.svg",
    "favicon.ico",
]


def find_icon() -> Path | None:
    for candidate in (ROOT / "assets" / "app.ico", ROOT / "app.ico", PUBLIC_DIR / "favicon.ico"):
        if candidate.exists():
            return candidate
    return None


def add_data_arg(path: Path, destination: str = ".") -> str:
    separator = ";" if os.name == "nt" else ":"
    return f"{path}{separator}{destination}"


def main() -> int:
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--windowed",
        "--clean",
        "--noconfirm",
        "--name",
        "Fina",
        str(ENTRYPOINT),
    ]

    icon = find_icon()
    if icon is not None:
        cmd.extend(["--icon", str(icon)])

    for filename in DATA_FILES:
        file_path = PUBLIC_DIR / filename
        if file_path.exists():
            cmd.extend(["--add-data", add_data_arg(file_path, "public")])

    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        print("Build falhou. Verifique se as dependencias foram instaladas com:")
        print(f"  {sys.executable} -m pip install -r requirements.txt")
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
