const path = require('path');
const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 8080;
const publicDirectory = __dirname;

app.use(express.static(publicDirectory));

app.get('/', (request, response) => {
  response.sendFile(path.join(publicDirectory, 'index.html'));
});

app.listen(port, () => {
  console.log(`PocketMoney is running at http://localhost:${port}`);
});
