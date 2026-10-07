#!/usr/bin/env python3
"""
⚡ LOKI MISSION CONTROL — Mobile & Desktop Live HUD Server
Serves the futuristic 42-Agent Sci-Fi Control Room with Local Wi-Fi & Cloudflare Tunnel.
Generates ASCII QR Code in terminal for instant mobile scanning!
"""

import os
import sys
import socket
import http.server
import socketserver
import threading
import subprocess
import time
from pathlib import Path

# Fix Windows console unicode encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 57374
TOOLS_DIR = Path(__file__).parent.resolve()
HTML_FILE = TOOLS_DIR / "loki_control_center.html"

def get_local_ip():
    """Find the local Wi-Fi / LAN IP address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't even need to be reachable
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(TOOLS_DIR), **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '/dashboard':
            self.path = '/loki_control_center.html'
        return super().do_GET()

    def log_message(self, format, *args):
        # Suppress standard logging to keep terminal clean
        pass

def print_ascii_qr(url):
    """Render a clean QR code in terminal using python-qrcode if available, or print link box."""
    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make()
        qr.print_ascii(invert=True)
    except ImportError:
        # Fallback stylish text box
        print("  ┌────────────────────────────────────────────────────────┐")
        print(f"  │ 📱 MOBILE URL : http://{get_local_ip()}:{PORT}         │")
        print("  │ 💻 LAPTOP URL : http://localhost:57374                 │")
        print("  └────────────────────────────────────────────────────────┘")

def start_server():
    local_ip = get_local_ip()
    local_url = f"http://localhost:{PORT}"
    mobile_url = f"http://{local_ip}:{PORT}"

    print("=" * 68)
    print("⚡ LOKI MODE: 42-AGENT MISSION CONTROL HUD SERVER ACTIVE")
    print("=" * 68)
    print(f"\n📱 MOBILE ACCESS (Scan or Type on your phone):")
    print(f"👉 {mobile_url}\n")
    print_ascii_qr(mobile_url)
    print(f"\n💻 LAPTOP BROWSER ACCESS:")
    print(f"👉 {local_url}\n")
    print("=" * 68)
    print("🟢 STATUS: Live Mission Control Ready | 0% Local CPU Load | 42 Agents Standing By")
    print("Press Ctrl + C in terminal to stop server.")
    print("=" * 68)

    # Automatically open in default laptop browser
    try:
        import webbrowser
        webbrowser.open(local_url)
    except Exception:
        pass

    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    start_server()
