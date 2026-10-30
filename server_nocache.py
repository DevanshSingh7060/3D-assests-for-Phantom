import http.server
import socketserver
import os

# Mirrors the clean-URL behavior Vercel provides in production (cleanUrls: true):
# a request for /aegis is served from aegis.html, with no redirect and no
# change to the URL in the browser's address bar. Keeping this map in sync
# with vercel.json ensures local dev and production routing agree.
CLEAN_URL_MAP = {
    '/workspace': '/workspace.html',
    '/smriti': '/smriti.html',
    '/aegis': '/aegis.html',
    '/lumen': '/lumen.html',
    '/forge': '/forge.html',
    '/meridian': '/meridian.html',
    '/sentinel': '/sentinel.html',
    '/sense': '/sense.html',
    '/phantom': '/phantom.html',
}

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def translate_path(self, path):
        # Rewrite (not redirect): split off any query string, map the clean
        # route to its backing .html file, then let the default translation
        # resolve it to a filesystem path. The path in the address bar is
        # untouched because self.path itself is never changed.
        split_path = path.split('?', 1)
        route = split_path[0].rstrip('/')
        if route in CLEAN_URL_MAP:
            mapped = CLEAN_URL_MAP[route]
            if len(split_path) > 1:
                mapped += '?' + split_path[1]
            return super().translate_path(mapped)
        return super().translate_path(path)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    ThreadedHTTPServer.allow_reuse_address = True
    with ThreadedHTTPServer(("", 8080), NoCacheHTTPRequestHandler) as httpd:
        print("Serving DISHA no-cache on http://localhost:8080/index.html")
        httpd.serve_forever()
