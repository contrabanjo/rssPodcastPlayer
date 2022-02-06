const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'podcasts'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

function addPodcastToDB(guid){
  const sql = `INSERT IGNORE INTO podcasts
           VALUES("` + guid + `", DEFAULT, DEFAULT)`;
  connection.query(sql);
}

function updatePodcastSeconds(guid, seconds){
  const sql = `UPDATE podcasts SET seconds =` + seconds + ` WHERE guid = "` + guid + `"`;
  connection.query(sql);
}

function getPodcastSeconds(guid){
  const sql = `SELECT seconds FROM podcasts WHERE guid = "` + guid + `"`;
  return new Promise((resolve, reject)=>{
      connection.query(sql, (err, res)=>{
        if(err) return reject(err);
        return resolve(res);
      })
    })
}

function updatePodcastPlayed(guid, played){
  const sql = `UPDATE podcasts SET played =` + played + ` WHERE guid = "` + guid + `"`;
  connection.query(sql);
}

function getPodcastPlayed(guid){
  const sql = `SELECT played FROM podcasts WHERE guid ="` + guid + `"`
  return new Promise((resolve, reject)=>{
    connection.query(sql, (err, res)=>{
      if (err) return reject(err);
      return resolve(res);
    })
  })
}


module.exports.addPodcastToDB = addPodcastToDB;

module.exports.updatePodcastSeconds = updatePodcastSeconds;
module.exports.getPodcastSeconds = getPodcastSeconds;

module.exports.updatePodcastPlayed = updatePodcastPlayed;
module.exports.getPodcastPlayed = getPodcastPlayed;