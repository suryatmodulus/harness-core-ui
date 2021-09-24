const express = require('express')
const fs = require('fs')
const key = fs.readFileSync('./certificates/localhost-key.pem')
const cert = fs.readFileSync('./certificates/localhost.pem')
const https = require('https')
const app = express()
const PORT = 8080
const server = https.createServer({ key: key, cert: cert }, app)

function checkFileExistsSync(filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.constants.F_OK)
  } catch (e) {
    flag = false
  }
  console.log(filepath, flag)
  return flag
}

function getFile(req) {
  return `./cypress/fixtures${req.url.split('?')[0]}${req.method === 'POST' ? '.post' : ''}.json`
}

app.all('*', (req, res) => {
  if (req.get('Content-Type') === 'text/plain') {
    res.setHeader('Content-Type', 'text/plain')
  } else {
    res.setHeader('Content-Type', 'application/json')
  }
  const file = getFile(req)
  if (['POST', 'GET', 'PUT'].indexOf(req.method) > -1 && checkFileExistsSync(file)) {
    res.end(fs.readFileSync(file))
  } else {
    res.end(
      JSON.stringify({
        correlationId: '',
        data: {},
        status: 'SUCCESS'
      })
    )
  }
})
server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
