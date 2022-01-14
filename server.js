const rssURL = require('./url.json')

const express = require('express');
const path = require('path');

const rssParser = require('rss-parser');

const db = require('./db.js');

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

app.use(express.static("public"))
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
})

app.get('/podcasts', (req, res) => {
  let parser = new rssParser();
  (async () => {
    let feed = await parser.parseURL(rssURL.url);
    res.send(feed);
  })();
})

app.post('/podcast',(req, res)=> {
  db.addPodcastToDB(req.body.url);
  res.send();
})

app.get('/listening', (req, res)=> {
  res.sendFile(path.join(__dirname, "/public/listening.html"));
})

const server = app.listen(port, () => {
  const { port } = server.address()
  console.log(`Listening on http:/localhost:${port}`)
})
