const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const port = 3000;
const imagesDir = path.join(__dirname, 'images');

const ensureImagesDirExists = async () => {
    try {
        await fs.mkdir(imagesDir, { recursive: true });
    } catch (error) {
        console.error('Error creating images directory:', error);
    }
};

const requestHandler = async (req, res) => {
    const code = req.url.slice(1); // Отримуємо код з URL
    const imagePath = path.join(imagesDir, `${code}.jpg`); // Вказуємо шлях до картинки

    switch (req.method) {
        case 'GET':
            try {
                await fs.access(imagePath); // Перевіряємо, чи існує файл
                const image = await fs.readFile(imagePath); // Читаємо файл
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(image);
            } catch (error) {
                console.error('Error reading image file:', error); // Логування помилки
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Image not found');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            }
            break;

        case 'PUT':
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });
            req.on('end', async () => {
                const imageBuffer = Buffer.concat(body);
                try {
                    await fs.writeFile(imagePath, imageBuffer); // Записуємо картинку
                    res.writeHead(201, { 'Content-Type': 'text/plain' });
                    res.end('Image created/updated');
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            });
            break;

        case 'DELETE':
            try {
                await fs.unlink(imagePath); // Видаляємо файл
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Image deleted');
            } catch (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Image not found');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            }
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
            break;
    }
};

const server = http.createServer(requestHandler);

ensureImagesDirExists().then(() => {
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
});
