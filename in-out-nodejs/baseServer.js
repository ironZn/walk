const http = require('http')

const fs = require('fs')

const url = require('url')

const path = require('path')


http.createServer((req, res) => {

    console.log(req.url)

    let pathname = url.parse(req.url).pathname

    if (pathname == '/'){
        pathname = 'index.html'
    }

    // console.log('00000',pathname)

    if(pathname == '/favicon.ico') {
        res.end('')
    } else {

        const extname = path.extname(pathname)
    
        const mime = getMime(extname)
    
        res.writeHead(200, {"Content-type": mime})
    
        const ctx = fs.readFileSync(`./${pathname}`,'utf-8')
    
        res.end(ctx)
    }

}).listen(65534)

function getMime(extname){
    switch (extname){
        case ".html":
            return "text/html"
            break
        case ".jpg":
            return "image/jpg"
            break;
        case ".png":
            return "image/png"
            break;
        case ".css":
            return "text/css"
            break;
    }
}