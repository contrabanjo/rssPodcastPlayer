USE podcasts;
DROP TABLE podcasts;
CREATE TABLE podcasts (guid VARCHAR(10) PRIMARY KEY, played BOOLEAN default FALSE, seconds SMALLINT default 0);