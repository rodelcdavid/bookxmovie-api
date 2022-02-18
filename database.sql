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
-- login table
-- user table