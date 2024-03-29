-- matchups table
-- id, bookinfo, movieinfo, bookvotes, movievotes, popularity
CREATE TABLE matchups(
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    bookInfo JSON NOT NULL,
    movieInfo JSON NOT NULL,
    bookVotes INTEGER NOT NULL,
    movieVotes INTEGER NOT NULL,
    popularity INTEGER NOT NULL
);

--underscore
CREATE TABLE matchups(
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    book_info JSON NOT NULL,
    movie_info JSON NOT NULL,
    book_votes INTEGER NOT NULL,
    movie_votes INTEGER NOT NULL,
    popularity INTEGER NOT NULL
);

-- TODO: Add date voted
--uservotes table
CREATE TABLE user_votes(
    user_id VARCHAR NOT NULL,
    matchup_id VARCHAR(50) NOT NULL,
    voted_for VARCHAR(10) NOT NULL
);

--add new vote
INSERT INTO user_votes VALUES ('1234', 'c0937594-c273-409e-a39f-48876d96b0fb', 'book');

--Combine matchups and user_votes
SELECT * FROM user_votes RIGHT JOIN matchups ON matchups.id=user_votes.matchup_id AND user_votes.user_id='1234';

--update matchups votes
UPDATE matchups SET movie_votes = 1344, book_votes = 3143 WHERE id = 'c0937594-c273-409e-a39f-48876d96b0fb';


--users
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(320) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    joined TIMESTAMP NOT NULL
);

--login
CREATE TABLE login(
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);