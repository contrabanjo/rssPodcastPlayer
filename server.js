const rssURL = require('./url.json')

const express = require("express");
const path = require('path');
let Parser = require('rss-parser');

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use(express.static("public"))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
})

app.get('/podcasts', (req, res) => {
  let parser = new Parser();
  (async () => {
    let feed = await parser.parseURL(rssURL.url);
    res.send(feed);
  })();
})

app.get('/listening', (req, res)=> {
  res.sendFile(path.join(__dirname, "/public/listening.html"));
})

const server = app.listen(port, () => {
  const { port } = server.address()
  console.log(`Listening on http:/localhost:${port}`)
})
