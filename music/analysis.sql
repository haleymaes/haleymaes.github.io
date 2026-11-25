-- SELECT * FROM Replay: my Apple Music library, in SQL (SQLite)
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
-- Apple Music Replay, typed in from the Replay screens: each month's #1 artist
-- (2023 to October 2026), minutes per month (shown for 2026), and full-year
-- minutes (2023-2025). Replay counts everything I streamed, saved or not.
CREATE TABLE replay_month (
  month      TEXT PRIMARY KEY,   -- 'YYYY-MM'
  top_artist TEXT NOT NULL,
  minutes    INTEGER             -- NULL where Replay shows no monthly total
);
INSERT INTO replay_month (month, top_artist, minutes) VALUES
  ('2023-01', 'Beyoncé'         , NULL),
  ('2023-02', 'Chris Stapleton' , NULL),
  ('2023-03', 'Morgan Wallen'   , NULL),
  ('2023-04', 'Luke Combs'      , NULL),
  ('2023-05', 'Luke Combs'      , NULL),
  ('2023-06', 'Luke Combs'      , NULL),
  ('2023-07', 'Morgan Wallen'   , NULL),
  ('2023-08', 'Morgan Wallen'   , NULL),
  ('2023-09', 'Morgan Wallen'   , NULL),
  ('2023-10', 'Luke Combs'      , NULL),
  ('2023-11', 'Luke Combs'      , NULL),
  ('2023-12', 'Morgan Wallen'   , NULL),
  ('2024-01', 'Luke Combs'      , NULL),
  ('2024-02', 'Morgan Wallen'   , NULL),
  ('2024-03', 'Morgan Wallen'   , NULL),
  ('2024-04', 'Morgan Wallen'   , NULL),
  ('2024-05', 'Morgan Wallen'   , NULL),
  ('2024-06', 'Kenny Chesney'   , NULL),
  ('2024-07', 'Kenny Chesney'   , NULL),
  ('2024-08', 'Luke Combs'      , NULL),
  ('2024-09', 'Morgan Wallen'   , NULL),
  ('2024-10', 'Morgan Wallen'   , NULL),
  ('2024-11', 'Whitney Houston' , NULL),
  ('2024-12', 'Kenny Chesney'   , NULL),
  ('2025-01', 'Morgan Wallen'   , NULL),
  ('2025-02', 'Luke Combs'      , NULL),
  ('2025-03', 'Luke Combs'      , NULL),
  ('2025-04', 'Luke Combs'      , NULL),
  ('2025-05', 'Morgan Wallen'   , NULL),
  ('2025-06', 'Luke Combs'      , NULL),
  ('2025-07', 'Post Malone'     , NULL),
  ('2025-08', 'Luke Combs'      , NULL),
  ('2025-09', 'Ariana Grande'   , NULL),
  ('2025-10', 'Luke Combs'      , NULL),
  ('2025-11', 'Luke Combs'      , NULL),
  ('2025-12', 'Luke Combs'      , NULL),
  ('2026-01', 'Morgan Wallen'   , 3278),
  ('2026-02', 'Morgan Wallen'   , 5218),
  ('2026-03', 'Morgan Wallen'   , 4349),
  ('2026-04', 'Morgan Wallen'   , 4803),
  ('2026-05', 'Morgan Wallen'   , 6731),
  ('2026-06', 'Morgan Wallen'   , 5091),
  ('2026-07', 'Ariana Grande'   , 5276),
  ('2026-08', 'Morgan Wallen'   , 4901),
  ('2026-09', 'Morgan Wallen'   , 4578),
  ('2026-10', 'Morgan Wallen'   , 4047);
CREATE TABLE replay_year (year INTEGER PRIMARY KEY, minutes INTEGER NOT NULL);
INSERT INTO replay_year (year, minutes) VALUES (2023, 44767), (2024, 35538), (2025, 41848);

-- name: number_ones
-- Who held #1 each month, and how many months each artist held it.
SELECT month,
       top_artist AS artist,
       COUNT(*) OVER (PARTITION BY top_artist) AS months_at_one
FROM replay_month
ORDER BY month;

-- name: months_vs_library
-- Months at #1 next to all-time plays in my library (solo credits, as in the
-- top-artist chart). Replay is one month of streaming; the library is all of it.
WITH months AS (
  SELECT top_artist AS artist, COUNT(*) AS months_at_one, MIN(month) AS first_month
  FROM replay_month
  GROUP BY top_artist
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

-- name: minutes_by_month
-- Listening minutes per month, and per day. The day count comes from the
-- calendar: the first of the month, plus a month, minus a day.
WITH m AS (
  SELECT month, minutes,
         CAST(strftime('%d', month || '-01', '+1 month', '-1 day') AS INTEGER) AS days
  FROM replay_month
  WHERE minutes IS NOT NULL
)
SELECT month,
       minutes,
       days,
       ROUND(1.0 * minutes / days) AS minutes_per_day,
       ROUND(minutes / 60.0, 1)    AS hours
FROM m
ORDER BY month;

-- name: minutes_by_year
-- Full-year totals for 2023-2025, and 2026 so far, summed from its months.
SELECT year, minutes, 12 AS months
FROM replay_year
UNION ALL
SELECT CAST(substr(month, 1, 4) AS INTEGER), SUM(minutes), COUNT(*)
FROM replay_month
WHERE minutes IS NOT NULL
GROUP BY substr(month, 1, 4)
ORDER BY year DESC;

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

-- name: song_length
-- Skip rate by song length, in one-minute bands (1 = under 2 minutes, 5 = 5+).
WITH banded AS (
  SELECT *, MAX(1, MIN(5, duration_ms / 60000)) AS band
  FROM songs
  WHERE duration_ms IS NOT NULL
)
SELECT band,
       CASE band WHEN 1 THEN 'Under 2 min' WHEN 5 THEN '5+ min'
                 ELSE band || '–' || (band + 1) || ' min' END                  AS length,
       COUNT(*)                                                                AS songs,
       SUM(play_count)                                                         AS plays,
       ROUND(100.0 * SUM(play_count) / (SELECT SUM(play_count) FROM songs), 1) AS pct_of_plays,
       ROUND(100.0 * SUM(skip_count) / (SUM(play_count) + SUM(skip_count)), 1) AS skip_rate
FROM banded
GROUP BY band
ORDER BY band;

-- name: length_extremes
-- The shortest and longest songs I've played at least 30 times.
SELECT * FROM (
  SELECT 'shortest' AS which, name, artist, album, duration_ms, play_count AS plays
  FROM songs WHERE play_count >= 30 ORDER BY duration_ms ASC LIMIT 1
)
UNION ALL
SELECT * FROM (
  SELECT 'longest', name, artist, album, duration_ms, play_count
  FROM songs WHERE play_count >= 30 ORDER BY duration_ms DESC LIMIT 1
);

-- name: one_hit_wonders
-- Songs I play a lot by artists I otherwise never play. Every name on a song
-- counts, so a duet with Luke Combs is not a one-hit wonder; two saves of the
-- same song count once.
WITH RECURSIVE credits(track_id, rest, credit) AS (    -- split "A, B & C" into names
  SELECT track_id, REPLACE(REPLACE(artist, ' & ', '|'), ', ', '|') || '|', NULL
  FROM songs
  WHERE play_count > 0
  UNION ALL
  SELECT track_id, substr(rest, instr(rest, '|') + 1), trim(substr(rest, 1, instr(rest, '|') - 1))
  FROM credits
  WHERE rest <> ''
),
played AS (                                            -- every name on a song I've played
  SELECT c.credit, s.name AS song, s.track_id
  FROM credits c JOIN songs s USING (track_id)
  WHERE c.credit <> ''
),
regulars AS (                                          -- names with 2+ different songs played
  SELECT credit FROM played GROUP BY credit HAVING COUNT(DISTINCT lower(song)) > 1
)
SELECT s.name, s.artist, s.play_count AS plays,
       (SELECT COUNT(*) FROM songs o
        WHERE o.artist = s.artist AND o.track_id <> s.track_id) AS other_songs_saved
FROM songs s
WHERE s.play_count > 0
  AND NOT EXISTS (SELECT 1 FROM played p JOIN regulars r USING (credit)
                  WHERE p.track_id = s.track_id)
ORDER BY s.play_count DESC
LIMIT 10;
