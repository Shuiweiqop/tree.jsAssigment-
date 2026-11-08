# 3D Data Visualization

A web page that signs the user in with Google, reads user records from a Google Sheet, and shows them as interactive cards in four 3D layouts (Table, Sphere, Helix, Grid). It is built with Three.js (`CSS3DRenderer`) and Vite.

## Live demo

- Demo: [PASTE THE DEPLOYED URL]
- Source: [PASTE THE GITHUB URL]

## Requirements checklist

| # | Requirement | Where | Checked by |
|---|---|---|---|
| 1 | Google Sheet imported from the CSV and shared with lisa@kasatria.com | Google Sheets, tab `Kasatria Data` | Manual |
| 2 | Page with Google sign-in | `index.html`, `app.js` | Manual |
| 3 | Data read from the Sheet | `fetchSheetData` in `app.js`, `src/data.js` | `test/data.test.js` |
| 4 | Tile shows country, age, photo, name, interest | `createTile` in `app.js`, `style.css` | Manual |
| 5 | Background colour by Net Worth | `src/colors.js` | `test/colors.test.js` |
| 6 | Table, 20 x 10 | `src/layouts.js` | `test/layouts.test.js`, `test/bounds.test.js` |
| 7 | Sphere | `src/layouts.js` | `test/layouts.test.js` |
| 8 | Double helix | `src/layouts.js` | `test/layouts.test.js` |
| 9 | Grid, 5 x 4 x 10 | `src/layouts.js` | `test/layouts.test.js` |

The Table bounding box in `test/bounds.test.js` is 3780 x 2680, which equals 19 x 190 + 170 and 9 x 270 + 250, so it confirms 20 columns and 10 rows.

## Getting started

Requires Node.js 20.19+ or 22.12+ (needed by Vite 8).

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

To check the production build locally:

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

Tests use Vitest and cover the pure modules (no browser needed):

| File | What it checks |
|---|---|
| `test/layouts.test.js` | Table has 200 distinct positions, Sphere tiles sit at radius 1200, Grid has 5 x 4 x 10 distinct coordinates, Helix strands are at the same height, on opposite sides, with a constant rise |
| `test/bounds.test.js` | Empty input, a single tile, and the full Table bounding box |
| `test/camera.test.js` | Camera distance from bounds, field of view and depth |
| `test/colors.test.js` | The three colour bands and their boundaries |
| `test/data.test.js` | Parsing of sheet rows, including `$` and thousands separators |

## Configuration

The constants are at the top of `app.js`:

| Constant | Meaning |
|---|---|
| `CLIENT_ID` | Google OAuth client ID (Web application) |
| `SPREADSHEET_ID` | ID of the Google Sheet |
| `RANGE` | Range to read, `'Kasatria Data'!A1:F201` |

To run it with your own Google project:

1. Enable the Google Sheets API.
2. Create an OAuth client of type Web application and copy its client ID.
3. Add `http://localhost:5173` and your deployed URL to Authorized JavaScript origins (no trailing slash).
4. Add the accounts that need access as Test users on the consent screen.
5. Share the Sheet with those accounts.

The app requests one scope: `https://www.googleapis.com/auth/spreadsheets.readonly`.

## Signing in (for reviewers)

- Use a Google account that can read the Sheet. The Sheet is shared with `lisa@kasatria.com`.
- The OAuth app is in Testing mode, so only accounts listed as Test users can sign in.
- The first sign-in shows "Google hasn't verified this app". Click **Advanced**, then **Go to ... (unsafe)**. The only permission requested is read-only access to Google Sheets.
- The access token is kept in memory only. Reloading the page requires signing in again.

## How it works

1. Google Identity Services (token model) returns an access token after the user signs in.
2. The Sheets API v4 is called with that token, and rows are parsed by `transformData`.
3. Each record becomes a DOM tile wrapped in a `CSS3DObject`.
4. `computeLayoutPosition(layout, index, total)` returns the target position for every tile. It is a pure function, which is why it can be unit tested.
5. Tiles move to their targets with a 1.2 second transition (linear interpolation of position, spherical interpolation of rotation).
6. The camera distance is recalculated for the new layout and again on window resize.

## Design decisions

**Net Worth colours**

| Net Worth | Colour |
|---|---|
| below $100,000 | Red `#ef4444` |
| $100,000 to $200,000 (both inclusive) | Orange `#f97316` |
| above $200,000 | Green `#22c55e` |

The brief does not say which band the exact values 100,000 and 200,000 belong to, so both are orange. The exact amount is shown as a tooltip when hovering a tile, and the tile itself shows colour only.

**Table**: 20 columns x 10 rows, 190 x 270 spacing, centred on the origin.

**Sphere**: radius 1200. Tile `i` of `n` uses `phi = acos(-1 + 2i / n)` and `theta = sqrt(n * pi) * phi`, the same distribution as the Three.js periodic table example. Tiles face outward.

**Double helix**: radius 1100. Even tiles form one strand and odd tiles the other, offset by 180 degrees.

- `angleStep = (TILE_WIDTH + arcGap) / radius`, so tiles on one strand almost touch along the arc.
- `pitch = 2 * (TILE_HEIGHT + arcGap)`, so the other strand fits between two turns of this one.
- Each strand makes about 2.7 turns.

**Grid**: 5 x 4 tiles per layer and 10 layers, spaced 350 x 350 x 260.

**Camera fit**: the required distance is `max(height / (2 tan(fov/2)), width / (2 tan(fov/2) * aspect)) + depth / 2`, multiplied by 1.1 for a 10% margin. `getBounds` supplies the width, height and depth from the target positions.

**Back faces**: tiles on the far side of the Sphere and Helix are not hidden. [EDIT THIS LINE IF YOU ADD `backface-visibility: hidden`]

## Known limitations

- The access token expires after about an hour, after which the user has to sign in again. There is no silent refresh.
- The range is fixed to `A1:F201`, and columns are read by position: name, photo, age, country, interest, net worth.
- Photos are loaded from the URLs in the Sheet. A broken URL leaves an empty space on the tile.
- Tested in [LIST THE BROWSERS YOU TESTED, e.g. Chrome and Edge on Windows].

## Project structure

```
index.html        Page markup: login card, toolbar, 3D container
style.css         Login screen, toolbar and tile styles
app.js            Google sign-in, data loading, Three.js scene, transitions
src/layouts.js    Positions for Table, Sphere, Helix and Grid
src/bounds.js     Bounding box of a set of target positions
src/camera.js     Camera distance calculation
src/data.js       Parsing of sheet rows into records
src/colors.js     Net Worth to colour
test/             Vitest unit tests
```