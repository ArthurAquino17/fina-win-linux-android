from __future__ import annotations

import sys
import threading
import time
import webbrowser
import errno
import socket
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
        "js/app-data.js",
        "js/app-utils.js",
        "js/app-storage.js",
        "js/market-data.js",
        "js/app-cards.js",
        "js/app-investments.js",
        "js/app-portfolio.js",
        "js/app-education.js",
        "js/app-backup.js",
        "js/app-finance.js",
        "js/app-dashboard.js",
        "js/app-forms.js",
        "js/app-navigation.js",
        "js/app-auth.js",
        "js/app-events.js",
        "js/app-pwa.js",
        "js/app-boot.js",
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


def is_port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
        except OSError:
            return False
    return True


def main() -> int:
    last_error: OSError | None = None
    for port in range(DEFAULT_PORT, DEFAULT_PORT + 20):
        if not is_port_available(port):
            print(f"Porta {port} ocupada, tentando a proxima...")
            continue
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
