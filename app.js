const express = require('express')
const https = require('https');
const fs = require('fs');

const app = express()
const port = process.env.PORT || '3001'

const key = fs.readFileSync('./dev_ssl_cert/key.pem');
const cert = fs.readFileSync('./dev_ssl_cert/cert.pem');

app.use(express.static('public'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = https.createServer({key: key, cert: cert }, app);
console.log(`Running on ${port}`);
server.listen(port)