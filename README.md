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

