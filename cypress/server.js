const express = require('express')
const fs = require('fs')
const key = fs.readFileSync('./certificates/localhost-key.pem')
const cert = fs.readFileSync('./certificates/localhost.pem')
const https = require('https')
const app = express()
const PORT = 8080
const server = https.createServer({ key: key, cert: cert }, app)
app.get('*', (req, res) => res.send('Express + TypeScript Server'))
server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
