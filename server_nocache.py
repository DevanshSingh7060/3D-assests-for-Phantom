import http.server
import socketserver
import os

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir('/Users/devanshsingh/.gemini/antigravity-ide/scratch/smriti')
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", 8080), NoCacheHTTPRequestHandler) as httpd:
        print("Serving SMRITI no-cache on http://localhost:8080/index.html")
        httpd.serve_forever()
