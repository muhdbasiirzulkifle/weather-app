# Weather Window

A beginner-friendly weather app built with **HTML, CSS, and vanilla JavaScript**. No frameworks, packages, API keys, or build step are needed to run the starter.

**The API integration is intentionally unfinished.** Students implement the two empty API functions in `script.js`. The interface works immediately using clearly labeled sample data.

## Run the app

Open `index.html` in your browser. That's enough for the sample-data version.

For development and the API exercise, use a local web server, such as your editor's Live Server extension, or run this from the project folder if Python is installed:

```sh
python3 -m http.server 8000
```

Then visit **http://localhost:8000**. Stop the server with `Ctrl+C`.

## What's included

- Responsive layout for phones and desktops.
- City search with a location picker.
- Current temperature, condition, feels-like temperature, humidity, and wind speed.
- Five-day forecast with high/low temperatures and rain probability.
- Celsius/Fahrenheit switching without another request.
- Loading, empty-search, no-results, and error messages.
- Labeled controls, keyboard focus indicators, and an announced status message.

In practice mode, **only Kuala Lumpur is available**. Search for `Kuala Lumpur` or part of its name, such as `kuala`, and choose the result. Other names demonstrate the no-results state. The fixed sample dates and weather are fictional, not current observations. Refreshing resets the app.

## Project structure

```text
weather-app/
├── index.html  # Page structure and accessible controls
├── style.css   # Colors, layout, cards, and responsive styles
├── script.js   # Sample data, interactions, rendering, and API exercises
└── README.md   # Setup, lesson guide, and student tasks
```

## Suggested teaching sequence

### 1. HTML: build the structure

Explore `header`, `main`, `section`, `form`, and `footer`. Discuss how a label connects to an input using `for` and `id`, why search uses a form, and how `hidden` controls which sections are visible.

**Try it:** Change the title and introductory text.

### 2. CSS: style the page

Start with the custom properties in `:root`. Follow how Flexbox arranges the search controls and how CSS Grid lays out the forecast. Resize the browser to see the media queries in action.

**Try it:** Change the color palette or the mobile forecast column count.

### 3. JavaScript: data and the DOM

Read `DEMO_LOCATION` and `DEMO_WEATHER` first. They introduce objects, arrays, and nested properties. Each index in the daily arrays describes the same day: index `0` is the first forecast date, its high, its low, its condition code, and its rain probability.

Then follow these functions:

| Function | Concept |
| --- | --- |
| `handleSearch()` | Form events, trimming input, filtering, and conditional logic |
| `renderLocations()` | Creating buttons and attaching click handlers |
| `loadWeather()` | Async control flow and updating application state |
| `renderWeather()` | Reading object properties and updating `textContent` |
| `renderForecast()` | Looping through arrays and creating DOM elements |
| `describeWeather()` | Mapping numerical codes to readable conditions |
| `changeUnit()` | State, event listeners, and rendering again |
| `formatTemperature()` | A reusable function and a mathematical conversion |

API-provided text is inserted using `textContent`, so a location name is treated as text rather than HTML.

**Try it:** Change the sample temperature and a forecast condition code. Check both units. Celsius becomes Fahrenheit using `(celsius × 9 / 5) + 32`. The original data stays in Celsius, avoiding cumulative conversion errors.

### 4. APIs: complete the student exercise

The two API functions contain **comments only**. There are no network requests in the starter. Keep `USE_DEMO_DATA = true` while learning the UI, then implement both functions and set it to `false` to use them.

The suggested provider is [Open-Meteo](https://open-meteo.com/). Its free, non-commercial API does not require an API key; check its current usage terms and limits when connecting it.

#### Exercise A: `searchCities(query)`

Documentation: [Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

Endpoint: `https://geocoding-api.open-meteo.com/v1/search`

| Parameter | Value |
| --- | --- |
| `name` | The city name entered by the user |
| `count` | `5` |
| `language` | `en` |
| `format` | `json` |

Your function should:

1. Build the URL with `URL` and `URLSearchParams` so spaces and special characters are encoded correctly.
2. Request the URL with `fetch()` and `await` the response.
3. Check `response.ok`. An HTTP error does not automatically make `fetch()` throw.
4. Parse the response with `response.json()`.
5. Return the `results` array. If the API omits `results` when nothing matches, return an empty array.
6. Throw a helpful `Error` if the request fails. The existing `try/catch` displays its message.

Each result should include `name`, `latitude`, and `longitude`, with `admin1` and `country` when available. `DEMO_LOCATION` shows the expected shape. Return the array, not the entire response object. The picker lets users distinguish cities with the same name.

#### Exercise B: `fetchWeather(location)`

Documentation: [Weather Forecast API](https://open-meteo.com/en/docs)

Endpoint: `https://api.open-meteo.com/v1/forecast`

| Parameter | Value |
| --- | --- |
| `latitude` | `location.latitude` |
| `longitude` | `location.longitude` |
| `current` | `temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` |
| `daily` | `weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` |
| `timezone` | `auto` |
| `forecast_days` | `5` |
| `temperature_unit` | `celsius` |
| `wind_speed_unit` | `kmh` |

Build the request, check its status, parse the JSON, and return the **whole parsed weather object**. It should contain `timezone`, `current`, and `daily`, as demonstrated by `DEMO_WEATHER`. The API supplies `current.time` and `daily.time`; they are not additional variables to request.

Keep API temperatures in Celsius because the interface performs its own Fahrenheit conversion. Wind stays in km/h in both temperature modes. Rain probability is a percentage, not an amount of rainfall. The five-day forecast includes the location's current day.

**Timezone discussion:** With `timezone=auto`, API timestamps represent the searched city's local time. `formatLocalDate()` preserves those wall-clock values rather than converting them to the student's computer timezone.

#### Connect everything

Change the first line of `script.js` to:

```js
const USE_DEMO_DATA = false;
```

Reload the page. The app now calls `fetchWeather()` for the default city, Kuala Lumpur. Searching calls `searchCities()`, and choosing a result calls `fetchWeather()` again. The practice-mode notice disappears.

If you switch modes before finishing the functions, the app shows a reminder explaining the required return value. Internet access is needed once live requests are implemented.

## How the app flows

```text
Page opens → load default city → render weather and forecast

Submit a city → look up locations → choose a location
             → load its weather → render weather and forecast

Click °C or °F → change the selected unit → render stored data again
```

Search controls are disabled while a lookup is running, preventing overlapping searches. If a request fails, the error is displayed and the last successfully rendered weather remains visible. Its city name and observation time help identify which data is on screen.

## Manual checks

### With sample data

- Open the page: Kuala Lumpur, five forecast cards, and the practice-mode notice appear.
- Search `kuala`: choose the Kuala Lumpur result.
- Search `London`: a no-sample-city message appears.
- Submit only spaces: an input message appears.
- Toggle °F: `31°C` becomes `88°F`; feels-like and forecast temperatures also change.
- Toggle back: all temperatures return to their original Celsius values.
- Use Tab, Enter, and Space to operate the form, results, and unit controls.
- Try a 320px-wide viewport and a desktop viewport: content stays readable without horizontal page scrolling.

### After completing the API exercise

- Search for a real city and select it; confirm that its name and timezone update.
- Search `Springfield` and check that multiple matches are distinguishable.
- Search a nonsense name and verify the no-results message.
- Use the browser's Network panel to inspect the two different API responses.
- Enable offline mode in developer tools and search; verify an error appears and controls become usable again.
- Test an HTTP failure and make sure your `response.ok` checks produce a useful message.

## Optional follow-up exercises

- Save the chosen temperature unit using `localStorage`.
- Add a “use my location” button with the browser Geolocation API.
- Display sunrise and sunset after requesting the extra daily fields.
- Create your own CSS weather icons instead of emoji.

## Credits

The starter weather values are hand-written teaching samples. The API exercise uses Open-Meteo, whose geocoding data comes from GeoNames. Attribution links are included in the page footer. There are no external fonts, icon libraries, or JavaScript dependencies.
