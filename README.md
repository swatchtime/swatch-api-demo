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

 - `swatch`: string — beats with two-decimal centibeat precision (e.g. "123.45").
 - `whole`: string — floored integer part of beats, zero-padded to 3 digits (e.g. "005", "123").
 - `rounded`: string — nearest-integer beat, wrapped modulo 1000, zero-padded to 3 digits (e.g. 999.6 -> "000").
 - `time24` (BMT): string — 24-hour time derived from Biel Mean Time (e.g. "16:50:24").
 - `time12` (BMT): string — 12-hour time derived from Biel Mean Time (e.g. "04:50:24").
 - `ampm` (BMT): string — "AM" or "PM" for the `time12` field.
 - `date` (BMT): string — Biel date in `YYYY-MM-DD` (e.g. "2025-11-27").
 - `timestamp`: string — ISO-8601 UTC instant (e.g. `2025-11-27T15:50:24.851Z`) — use this for unambiguous UTC comparisons.

#### Implementation notes

- BMT (Biel Mean Time): the API's human-readable date/time fields (`time24`, `time12`, `ampm`, `date`) are presented in BMT — a canonical fixed offset of UTC+1 with no DST.
- Canonical computation (how `swatch` is derived):
	- Compute seconds since UTC midnight including milliseconds.
	- Add `3600` seconds (fixed offset for BMT) and wrap modulo `86400`.
	- Divide by `86.4` (seconds per beat) to get beats.
	- `swatch` is the beats value formatted to two decimals (centibeats).
	- `whole` is the floored integer part of beats (zero-padded to 3 digits).
	- `rounded` is the nearest integer of beats, then wrapped modulo 1000 and zero-padded to 3 digits.
- Prefer `timestamp` when you need UTC or when comparing events across timezones.
- `date`, `time24`, and `time12` are conveniences derived from the same Biel instant used to compute `swatch`, so they match the beat value.