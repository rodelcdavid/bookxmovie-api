-- match table
-- id, bookinfo, movieinfo, bookvotes, movievotes, popularity
CREATE TABLE matches(
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    bookInfo JSON NOT NULL,
    movieInfo JSON NOT NULL,
    bookVotes INTEGER NOT NULL,
    movieVotes INTEGER NOT NULL,
    popularity INTEGER NOT NULL
);

--underscore
CREATE TABLE matches(
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    book_info JSON NOT NULL,
    movie_info JSON NOT NULL,
    book_votes INTEGER NOT NULL,
    movie_votes INTEGER NOT NULL,
    popularity INTEGER NOT NULL
);

--uservotes table
CREATE TABLE user_votes(
    user_id VARCHAR NOT NULL,
    match_id VARCHAR(50) NOT NULL,
    voted_for VARCHAR(10) NOT NULL
);

--add new vote
INSERT INTO user_votes VALUES ('1234', 'c0937594-c273-409e-a39f-48876d96b0fb', 'book');

--Combine matches and user_votes
SELECT * FROM user_votes RIGHT JOIN matches ON matches.id=user_votes.match_id AND user_votes.user_id='1234';