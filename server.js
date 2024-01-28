const http = require('http');
const httpProxy = require('http-proxy');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  rl.question('Enter URL (with http/https): ', (url) => {
    const isValidUrl = /^(http|https):\/\//.test(url);

    if (!isValidUrl) {
      console.log('Invalid URL. Please include http:// or https://');
      rl.close(); // Close the readline interface if the URL is invalid
      return;
    }

    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const reqLog = `${timestamp} - Request ID: ${requestId}, URL: ${url}\n`;
    console.log(reqLog);
    appendToFile('req.txt', reqLog);

    proxy.web(req, res, {
      target: url,
      changeOrigin: true
    });

    const onResponse = (proxyRes) => {
      const resLog = `${timestamp} - Request ID: ${requestId}, Response Status: ${proxyRes.statusCode}\n`;
      console.log(resLog);
      appendToFile('res.txt', resLog);
      rl.close();
    };

    // Listen for the 'proxyRes' event only once
    proxy.once('proxyRes', onResponse);
  });
});

const port = 9000;
server.listen(port, () => {
  console.log(`Proxy server is running on http://localhost:${port}`);
});

// Add error handling for the server
server.on('error', (err) => {
  console.error('Server error:', err.message);
});

// Add a 'close' event listener to handle server termination
server.on('close', () => {
  console.log('Server closed');
});

function appendToFile(filename, data) {
  const fs = require('fs');
  fs.appendFile(filename, data, (err) => {
    if (err) {
      console.error('Error appending to file:', err.message);
    }
  });
}
