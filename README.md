# Swatch Time API Demo

Small, standalone demo showing how to use the Swatch Internet Time API. This demo is intentionally minimal and uses vanilla JavaScript + Bootstrap so it's easy to copy and adapt.

Endpoint: `https://api.swatchtime.online/api/v1/current`

- The demo shows a set of selectable `fields` that are sent as a comma-separated `fields` query parameter to the API. 
- The rendered `?fields=` text input element is **read-only** and updates as you check/uncheck boxes.
- Click the green **Fetch API data** button to retrieve data.
- The "Sample code to fetch API data" shows the exact query that is being sent to the API.
- The sample fetch code demonstrates a robust pattern: it checks `resp.ok`, returns `resp.json()` and includes a `.catch()` handler for errors.
- The Copy button copies the snippet to the clipboard and shows a short Bootstrap toast confirmation.
- The demo will display the raw JSON and a parsed, friendly view.


## Usage:

- Open `index.html` in a browser. 

- Or, run via a simple static web server:

```bash
python3 -m http.server 8000
# then load http://localhost:8000/swatch-api-demo in your browser
```

## Additional Resouces:

https://github.com/swatchtime

## License:

[MIT](LICENSE)


## API Field Formats (canonical)

The API returns fields following the project's canonical Swatch rules. When consuming the API, expect the following formats:

- `swatch`: string — Swatch time with two decimal centibeat precision (e.g. `"123.45"`).
- `whole`: string — integer beat part zero-padded to 3 digits (e.g. `"123"` → `"123"`, `"5"` → `"005"`).
- `rounded`: string — nearest integer beat, zero-padded to 3 digits and wrapped modulo 1000 (e.g. `999.6` → `"000"`).
- `time24` / `time12` / `ampm`: human-readable UTC time fields (24-hour and 12-hour with `AM`/`PM`).
- `timestamp`: ISO-8601 UTC timestamp (e.g. `2025-11-27T12:34:56.789Z`).

Implementation notes:

- The canonical computation uses UTC with a fixed +1 hour offset for Biel (BMT = UTC+1, no DST):
	- compute seconds since UTC midnight (including milliseconds), add `3600`, wrap modulo `86400`, then divide by `86.4` to get beats.
- The `swatch` field is formatted to two decimals; consumers should parse it as a number or display as-is.
- `rounded` is computed by rounding the beat to the nearest integer then applying `% 1000` to ensure wrap behavior.


