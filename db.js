const { Pool } = require('pg');
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect().then(console.log('db connected'));

function addPodcastToDB(guid){
  const sql = "INSERT INTO podcasts VALUES(" + guid  + ", DEFAULT, DEFAULT) ON CONFLICT (guid) DO NOTHING;";
  try {
    client.query(sql);
  } catch {
    console.error(err)
  }
}


function updatePodcastSeconds(guid, seconds){
   const sql = "UPDATE podcasts SET seconds =" + seconds + " WHERE guid = " + guid +";";
   client.query(sql);
}


function getPodcastSeconds(guid){
   const sql = "SELECT seconds FROM podcasts WHERE guid = " + guid + ";";
   return new Promise((resolve, reject)=>{
       client.query(sql, (err, res)=>{
         if(err) return reject(err);
         return resolve(res);
       })
     })
}

function updatePodcastPlayed(guid, played){
  const sql = "UPDATE podcasts SET played =" + played + " WHERE guid = " + guid + ";";
  client.query(sql);
}

function getPodcastPlayed(guid){
  const sql = "SELECT played FROM podcasts WHERE guid =" + guid + ";";
  return new Promise((resolve, reject)=>{
    client.query(sql, (err, res)=>{
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