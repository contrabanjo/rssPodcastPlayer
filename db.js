const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})


pool.connect().then(client => {
    client.release();
    console.log('db connection successful')
});

function addPodcastToDB(guid){
  let sql;
  if (guid.length < 7) sql = "INSERT INTO podcasts VALUES(" + guid  + ", DEFAULT, DEFAULT) ON CONFLICT (guid) DO NOTHING;";
  else sql = "INSERT INTO podcasts VALUES" + guid  +  " ON CONFLICT (guid) DO NOTHING;";
  pool.connect((err, client, release)=> {
    if (err){
      return console.error("Error acquiring client", err.stack)
    }
    client.query(sql, (err, result)=>{
      release()
      if (err) {
        return console.error("Error executing query", err.stack)
      }
    })
  })
}

function getPodcast(guid){
  const sql = "SELECT * FROM podcasts WHERE guid = " + guid +";"
  return pool.query(sql);
}

function updatePodcastSeconds(guid, seconds){
   const sql = "UPDATE podcasts SET seconds =" + seconds + " WHERE guid = " + guid +";";
   pool.connect((err, client, release)=> {
    if (err){
      return console.error("Error acquiring client", err.stack)
    }
    client.query(sql, (err, result)=>{
      release()
      if (err) {
        return console.error("Error executing query", err.stack)
      }
    })
  })
}

function getPodcastSeconds(guid){
   const sql = "SELECT seconds FROM podcasts WHERE guid = " + guid + ";";
   return pool.query(sql);
}

function updatePodcastPlayed(guid, played){
  const sql = "UPDATE podcasts SET played =" + played + " WHERE guid = " + guid + ";";
  pool.connect((err, client, release)=> {
    if (err){
      return console.error("Error acquiring client", err.stack)
    }
    client.query(sql, (err, result)=>{
      release()
      if (err) {
        return console.error("Error executing query", err.stack)
      }
    })
  })
}

function getPodcastPlayed(guid){
  let sql;
  if (guid.length > 6 ) {
    sql = "SELECT * FROM podcasts WHERE guid IN (" + guid + ");";
  } else {
    sql = "SELECT played FROM podcasts WHERE guid =" + guid + ";";
  }
  return pool.query(sql)
}


module.exports.addPodcastToDB = addPodcastToDB;
module.exports.updatePodcastSeconds = updatePodcastSeconds;
module.exports.getPodcastSeconds = getPodcastSeconds;
module.exports.updatePodcastPlayed = updatePodcastPlayed;
module.exports.getPodcastPlayed = getPodcastPlayed;
module.exports.getPodcast = getPodcast;