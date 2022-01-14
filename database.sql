DROP TABLE podcasts;
CREATE TABLE podcasts (url VARCHAR(220), played BOOLEAN default 0, time TIME default 0000);
INSERT INTO podcasts VALUES("localhost:3000", DEFAULT, DEFAULT);