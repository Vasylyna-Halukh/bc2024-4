const fs = require('fs').promises;
const http = require('http');
const path = require('path');
const superagent = require('superagent');

const imagesDir = path.join(__dirname, 'images');

const supportedStatusCodes = [100, 200, 301, 400, 404, 500]; // Додайте інші підтримувані коди

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const statusCode = Number(url.slice(1)); // Витягуємо код статусу з URL

  if (!supportedStatusCodes.includes(statusCode)) {
    res.writeHead(400); // Bad Request
    res.end(`Error 400: Status code ${statusCode} is not supported`);
    return;
  }

  const filePath = path.join(imagesDir, `${statusCode}.jpg`);

  try {
    switch (method) {
      case 'GET':
        try {
          const data = await fs.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        } catch (error) {
          if (error.code === 'ENOENT') {
            try {
              const response = await superagent.get(`https://http.cat/${statusCode}`);
              await fs.writeFile(filePath, response.body);
              res.writeHead(200, { 'Content-Type': 'image/jpeg' });
              res.end(response.body);
            } catch (catError) {
              console.error('Error fetching from http.cat:', catError);
              res.writeHead(404);
              res.end(`Error 404: File not found for status code ${statusCode}`);
            }
          } else {
            console.error('Error reading file:', error);
            res.writeHead(500);
            res.end('Internal Server Error: Unable to read file');
          }
        }
        break;

      case 'PUT':
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          try {
            await fs.writeFile(filePath, buffer);
            res.writeHead(201); // Created
            res.end('Image created/updated successfully');
          } catch (error) {
            console.error('Error writing file:', error);
            res.writeHead(500);
            res.end('Internal Server Error: Unable to write file');
          }
        });
        req.on('error', error => {
          console.error('Request error:', error);
          res.writeHead(500);
          res.end('Internal Server Error');
        });
        break;

      case 'DELETE':
        try {
          await fs.unlink(filePath);
          res.writeHead(200);
          res.end('Image deleted successfully');
        } catch (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end(`Error 404: File not found for status code ${statusCode}`);
          } else {
            console.error('Error deleting file:', error);
            res.writeHead(500);
            res.end('Internal Server Error: Unable to delete file');
          }
        }
        break;

      default:
        res.writeHead(405); // Method Not Allowed
        res.end(`Error 405: ${method} method not supported`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
