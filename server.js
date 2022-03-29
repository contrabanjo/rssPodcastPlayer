const rssURL = require('./url.json')

const express = require('express');
const path = require('path');

const rssParser = require('rss-parser');

const db = require('./db.js');


// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

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
      try {
        let feed = await parser.parseURL(rssURL.url);
        res.send(feed);
      } catch(err){
        console.log(err)
      }
    })();
})

app.post('/podcast',(req, res)=> {
  db.addPodcastToDB(req.body.guid);
  res.send();
})

app.get('/seconds', (req, res)=>{
  db.getPodcastSeconds(req.query.guid).then(result => res.send(result.rows[0]));
})

app.post('/seconds', (req, res)=> {
  db.updatePodcastSeconds(req.body.guid, req.body.seconds);
  res.send();
})

app.post('/played', (req, res)=>{
  db.updatePodcastPlayed(req.body.guid, req.body.played);
  res.send();
})

app.get('/played', (req, res)=>{
  db.getPodcastPlayed(req.query.guid).then(result => {
    if (result.rows.length > 1) {
      const arr = result.rows.map(i => i.played);
      res.send(arr);
    } else {
      res.send(result.rows[0])
    }
  });
})

const server = app.listen(port, () => {
  const { port } = server.address()
  console.log(`Listening on port ${port}`)
})
