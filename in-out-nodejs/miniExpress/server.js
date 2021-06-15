const express = require('./express')
const fs = require('fs')
const path = require('path')

const app = express()

app.get('/', (req, res) => {
  fs.readFile(path.resolve(__dirname, './index.html'),(err, data) => {
    if (err) {
      res.statusCode = 500
      res.end('500 - Internal Server Error!')
      return
    }
    res.statusCode = 200
    // res.writeHead(200, {"Content-type": 'text/html'})
    res.end(data)
  })
})

// node ./in-out-nodejs/miniExpress/server.js

app.listen(3001)