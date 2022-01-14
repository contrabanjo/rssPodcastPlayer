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

function addPodcastToDB(url){
  let sql = `INSERT INTO podcasts
           VALUES("` + url + `", DEFAULT, DEFAULT)`;
  connection.query(sql);
}

module.exports.addPodcastToDB = addPodcastToDB;
