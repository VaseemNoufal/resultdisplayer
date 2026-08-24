# Badriya Higher Secondary Madrasa — Result & Announcement Display

A frontend-only, responsive result and announcement display system designed for a TV/projector during a madrasa event.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- JSON

No React, backend, database, Node.js, API, Supabase, Firebase, or external dependency is required.

## Project structure

```text
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── scores.js
├── assets/
│   ├── madrasa-logo.png
│   ├── posters.json
│   └── poster files...
└── README.md
```

## Adding posters

1. Put the poster image inside `assets/`.
2. Open `assets/posters.json`.
3. Add the exact filename as a string.

Example:

```json
[
  "poster-01.jpg",
  "poster-02.jpg",
  "new-result.png"
]
```

The slideshow automatically rotates every 4 seconds.

The page itself refreshes every 10 seconds so updated `posters.json` and `scores.js` values can be picked up.

## Updating scores

Open `js/scores.js`:

```js
const SCORES = {
  zumbaratulSwafa: 125,
  zumbaratulWafa: 110
};
```

Change the numbers, save, and the new values will appear after the next page refresh.

## Dark / light mode

Use the toggle in the header. The selected theme is stored in `localStorage`, so the 10-second page refresh does not reset the theme.

## Running locally

Because the site uses `fetch()` to load `assets/posters.json`, open it through a local/static web server rather than directly with `file://`.

For example, VS Code's Live Server extension can serve the folder.

It can also be deployed directly to a static hosting service.

## Important

The supplied madrasa logo is included unchanged at:

`assets/madrasa-logo.png`
