-- My Apple Music library, in SQL (SQLite)
-- One table, tracks, built from the Music app's library export by
-- music/build_music_data.py (file paths, IDs and playlist names are dropped).
-- Each block below is one question; the page shows them as written here.

-- name: clean
-- Apple uses 100+ genre labels, with duplicates like "Hip-Hop/Rap",
-- "Hip Hop/Rap", "Hip-Hop" and "Rap". Group them into families.
CREATE VIEW songs AS
SELECT *,
  CASE
    WHEN genre IN ('Country', 'Contemporary Country', 'Traditional Country', 'Alternative Country',
                   'Outlaw Country', 'Honky Tonk', 'Americana', 'Country Gospel') THEN 'Country'
    WHEN genre IN ('Hip-Hop/Rap', 'Hip Hop/Rap', 'Hip-Hop', 'Rap', 'West Coast Rap', 'Gangsta Rap',
                   'Underground Rap', 'Hardcore Rap', 'Dirty South', 'Alternative Rap') THEN 'Hip-Hop/Rap'
    WHEN genre IN ('Pop', 'Indie Pop', 'Vocal Pop', 'K-Pop', 'Pop/Rock', 'Adult Contemporary') THEN 'Pop'
    WHEN genre IN ('R&B/Soul', 'Soul', 'Neo-Soul', 'Contemporary R&B') THEN 'R&B/Soul'
    WHEN genre IN ('Rock', 'Alternative', 'Hard Rock', 'Indie Rock', 'Soft Rock', 'Rock & Roll', 'Punk',
                   'Metal', 'Adult Alternative', 'Folk-Rock', 'New Wave', 'British Invasion', 'Hardcore',
                   'Alternative Folk') THEN 'Rock & Alternative'
    WHEN genre IN ('Dance', 'Electronic', 'Electronica', 'House', 'Bass', 'Afro House', 'Downtempo',
                   'Disco') THEN 'Dance & Electronic'
    ELSE 'Everything else'
  END AS genre_family
FROM tracks;

-- name: overview
SELECT COUNT(*)                                          AS songs,
       SUM(play_count)                                   AS plays,
       SUM(skip_count)                                   AS skips,
       COUNT(DISTINCT artist)                            AS artists,
       ROUND(100.0 * SUM(play_count = 0) / COUNT(*), 1)  AS pct_never_played,
       ROUND(SUM(play_count * duration_ms) / 3600000.0)  AS hours_if_played_in_full,
       MIN(substr(date_added, 1, 4))                     AS first_year
FROM songs;

-- name: genre_mix
-- What I save vs what I play: each family's share of the library and of plays.
SELECT genre_family,
       COUNT(*)                                                             AS songs,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM songs), 1)            AS pct_of_library,
       SUM(play_count)                                                      AS plays,
       ROUND(100.0 * SUM(play_count) / (SELECT SUM(play_count) FROM songs), 1) AS pct_of_plays
FROM songs
GROUP BY genre_family
ORDER BY plays DESC;

-- name: top_artists
SELECT artist,
       SUM(play_count)                                                      AS plays,
       COUNT(*)                                                             AS songs,
       ROUND(100.0 * SUM(play_count) / (SELECT SUM(play_count) FROM songs), 1) AS pct_of_plays
FROM songs
GROUP BY artist
ORDER BY plays DESC
LIMIT 10;

-- name: concentration
-- How much of my listening comes from a handful of artists?
WITH by_artist AS (
  SELECT artist, SUM(play_count) AS plays,
         ROW_NUMBER() OVER (ORDER BY SUM(play_count) DESC) AS rank
  FROM songs GROUP BY artist
)
SELECT ROUND(100.0 * SUM(CASE WHEN rank <= 10 THEN plays END) / SUM(plays), 1) AS top_10_share,
       ROUND(100.0 * SUM(CASE WHEN rank = 1 THEN plays END) / SUM(plays), 1)   AS top_1_share,
       SUM(plays > 0)                                                          AS artists_played
FROM by_artist;

-- name: top_songs
SELECT name, artist, play_count AS plays
FROM songs
ORDER BY play_count DESC, skip_count ASC
LIMIT 10;

-- name: replay
-- Apple Music Replay's #1 artist for each month of 2023-2025, typed in from the
-- Replay screens. Replay counts everything I streamed, saved or not.
CREATE TABLE replay_number_one (month TEXT PRIMARY KEY, artist TEXT NOT NULL);
INSERT INTO replay_number_one (month, artist) VALUES
  ('2023-01', 'Beyoncé'), ('2023-02', 'Chris Stapleton'), ('2023-03', 'Morgan Wallen'),
  ('2023-04', 'Luke Combs'), ('2023-05', 'Luke Combs'), ('2023-06', 'Luke Combs'),
  ('2023-07', 'Morgan Wallen'), ('2023-08', 'Morgan Wallen'), ('2023-09', 'Morgan Wallen'),
  ('2023-10', 'Luke Combs'), ('2023-11', 'Luke Combs'), ('2023-12', 'Morgan Wallen'),
  ('2024-01', 'Luke Combs'), ('2024-02', 'Morgan Wallen'), ('2024-03', 'Morgan Wallen'),
  ('2024-04', 'Morgan Wallen'), ('2024-05', 'Morgan Wallen'), ('2024-06', 'Kenny Chesney'),
  ('2024-07', 'Kenny Chesney'), ('2024-08', 'Luke Combs'), ('2024-09', 'Morgan Wallen'),
  ('2024-10', 'Morgan Wallen'), ('2024-11', 'Whitney Houston'), ('2024-12', 'Kenny Chesney'),
  ('2025-01', 'Morgan Wallen'), ('2025-02', 'Luke Combs'), ('2025-03', 'Luke Combs'),
  ('2025-04', 'Luke Combs'), ('2025-05', 'Morgan Wallen'), ('2025-06', 'Luke Combs'),
  ('2025-07', 'Post Malone'), ('2025-08', 'Luke Combs'), ('2025-09', 'Ariana Grande'),
  ('2025-10', 'Luke Combs'), ('2025-11', 'Luke Combs'), ('2025-12', 'Luke Combs');

-- name: number_ones
-- Who held #1 each month, and how many months each artist held it.
SELECT month,
       artist,
       COUNT(*) OVER (PARTITION BY artist) AS months_at_one
FROM replay_number_one
ORDER BY month;

-- name: months_vs_library
-- Months at #1 next to all-time plays in my library (solo credits, as in the
-- top-artist chart). Replay is one month of streaming; the library is all of it.
WITH months AS (
  SELECT artist, COUNT(*) AS months_at_one, MIN(month) AS first_month
  FROM replay_number_one
  GROUP BY artist
),
library AS (
  SELECT artist, SUM(play_count) AS plays
  FROM songs
  GROUP BY artist
)
SELECT m.artist,
       m.months_at_one,
       m.first_month,
       COALESCE(l.plays, 0) AS library_plays,
       ROUND(100.0 * COALESCE(l.plays, 0) / (SELECT MAX(plays) FROM library), 1) AS pct_of_top_artist
FROM months AS m
LEFT JOIN library AS l USING (artist)
ORDER BY m.months_at_one DESC, library_plays DESC;

-- name: november_2024
-- The clue in the library: what I saved by Whitney Houston that November.
SELECT name, substr(date_added, 1, 10) AS added, play_count AS plays
FROM songs
WHERE artist LIKE '%Whitney Houston%'
  AND date_added LIKE '2024-11%'
ORDER BY date_added;

-- name: never_played
-- The save-it-for-later pile, by the year the songs were added.
SELECT substr(date_added, 1, 4)                        AS year_added,
       COUNT(*)                                        AS songs_added,
       ROUND(100.0 * SUM(play_count = 0) / COUNT(*), 1) AS pct_never_played
FROM songs
WHERE date_added >= '2020'
GROUP BY year_added
ORDER BY year_added;

-- name: skips
-- Skip rate by artist. Small sample size, very high variance: so only
-- artists with at least 150 plays and skips combined.
WITH rates AS (
  SELECT artist,
         SUM(play_count) AS plays,
         SUM(skip_count) AS skips,
         ROUND(100.0 * SUM(skip_count) / (SUM(play_count) + SUM(skip_count)), 1) AS skip_rate
  FROM songs
  GROUP BY artist
  HAVING SUM(play_count) + SUM(skip_count) >= 150
)
SELECT * FROM (SELECT 'most skipped' AS list, * FROM rates ORDER BY skip_rate DESC LIMIT 5)
UNION ALL
SELECT * FROM (SELECT 'least skipped' AS list, * FROM rates ORDER BY skip_rate ASC LIMIT 5);

-- name: decades
SELECT (year / 10) * 10 AS decade, SUM(play_count) AS plays, COUNT(*) AS songs
FROM songs
WHERE year >= 1950
GROUP BY decade
ORDER BY decade;
