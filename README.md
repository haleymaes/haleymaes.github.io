# Haley Maes — data analyst portfolio

Live site: [https://haleymaes.github.io](https://haleymaes.github.io)

This is a copy of the editorial-orbit homepage plus the six case studies it links to. The older circulating sites are not in this repo and are not updated from here:

- `https://haleymykellemaes-beep.github.io`
- `https://haleymykellemaes-beep.github.io/financial-analysis-sample-portfolio/`

## Local preview

```bash
python3 -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765).

## Apple Music project

`music/` is a personal SQL project linked from "Off the clock": the library export loaded into SQLite and queried.

- `analysis.sql`: every question as a named query.
- `build_music_data.py`: loads a new export and rewrites `music-data.js` (results only; the library itself is never published).
- `music.js`: draws the page's charts and the homepage card from `music-data.js`.

To refresh it after a new export from the Music app (File → Library → Export Library):

```bash
python3 music/build_music_data.py Library.xml music/analysis.sql music/music-data.js
```

