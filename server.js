const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = __dirname;
const port = process.env.PORT ? Number(process.env.PORT) : 8000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function contentTypeFor(filePath) {
  if (filePath.endsWith('.js.br')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.wasm.br')) return 'application/wasm';
  if (filePath.endsWith('.data.br')) return 'application/octet-stream';
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function contentEncodingFor(filePath) {
  return filePath.endsWith('.br') ? 'br' : undefined;
}

const server = http.createServer((req, res) => {
  const requestUrl = new url.URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const headers = {
      'Content-Type': contentTypeFor(filePath),
      'Cache-Control': 'no-cache'
    };

    const encoding = contentEncodingFor(filePath);
    if (encoding) {
      headers['Content-Encoding'] = encoding;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on port ${port}`);
});