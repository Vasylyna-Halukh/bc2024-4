const http = require('http');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);

const { host, port, cache } = program.opts();

if (!host || !port || !cache) {
  console.error('Усі параметри є обовʼязковими: --host, --port, --cache');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server start!\n');
});

server.listen(port, host, () => {
  console.log(`Сервер запущений на http://${host}:${port}/`);
  console.log(`Кеш директорія: ${cache}`);
});
