const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const port = 3000;

// Функція для обробки HTTP запитів
const requestHandler = async (req, res) => {
    const code = req.url.slice(1); // Отримуємо код з URL
    const imagePath = path.join(__dirname, 'images', `${code}.jpg`); // Вказуємо шлях до картинки

    try {
        // Перевіряємо, чи файл існує
        await fs.access(imagePath);
        
        // Читаємо файл
        const image = await fs.readFile(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image);
    } catch (error) {
        // Якщо файл не знайдено, повертаємо 404
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
};

// Створюємо сервер
const server = http.createServer(requestHandler);

// Запускаємо сервер
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
