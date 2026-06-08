from __future__ import annotations

import sys
import threading
import time
import webbrowser
import errno
from pathlib import Path

from bottle import Bottle, response, run, static_file


def get_base_dir() -> Path:
    frozen_dir = getattr(sys, "_MEIPASS", None)
    if frozen_dir:
        return Path(frozen_dir)
    return Path(__file__).resolve().parent


BASE_DIR = get_base_dir()
PUBLIC_DIR = BASE_DIR / "public" if (BASE_DIR / "public").exists() else BASE_DIR
APP = Bottle()
DEFAULT_PORT = 8080


def serve_file(filename: str) -> object:
    file_response = static_file(filename, root=str(PUBLIC_DIR))
    if hasattr(file_response, "set_header"):
        file_response.set_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        file_response.set_header("Pragma", "no-cache")
        file_response.set_header("Expires", "0")
    else:
        response.set_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        response.set_header("Pragma", "no-cache")
        response.set_header("Expires", "0")
    return file_response


@APP.get("/")
def index() -> object:
    return serve_file("index.html")


@APP.get("/<filepath:path>")
def assets(filepath: str) -> object:
    allowed = {
        "index.html",
        "styles.css",
        "app.js",
        "manifest.json",
        "sw.js",
        "icon.svg",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
        "favicon.ico",
    }
    if filepath not in allowed:
        return serve_file("index.html")
    return serve_file(filepath)


def open_browser(port: int) -> None:
    time.sleep(1.2)
    webbrowser.open(f"http://127.0.0.1:{port}")


def main() -> int:
    last_error: OSError | None = None
    for port in range(DEFAULT_PORT, DEFAULT_PORT + 20):
        try:
            threading.Thread(target=open_browser, args=(port,), daemon=True).start()
            print(f"Fina rodando em http://127.0.0.1:{port}")
            run(APP, host="127.0.0.1", port=port, quiet=True)
            return 0
        except OSError as exc:
            last_error = exc
            recoverable_errors = {errno.EADDRINUSE, errno.EACCES, 13, 98, 10013, 10048}
            if getattr(exc, "errno", None) not in recoverable_errors and getattr(exc, "winerror", None) not in recoverable_errors:
                raise

    if last_error is not None:
        raise last_error
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
