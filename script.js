const USE_DEMO_DATA = true;

const DEMO_LOCATION = {
  name: "Kuala Lumpur",
  admin1: "Kuala Lumpur",
  country: "Malaysia",
  latitude: 3.1412,
  longitude: 101.6865,
};

// The sample uses the same field names students will request from Open-Meteo.
const DEMO_WEATHER = {
  timezone: "Asia/Kuala_Lumpur",
  current: {
    time: "2026-07-06T14:00",
    temperature_2m: 31,
    apparent_temperature: 35,
    relative_humidity_2m: 74,
    wind_speed_10m: 12,
    weather_code: 2,
    is_day: 1,
  },
  daily: {
    time: ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10"],
    weather_code: [2, 61, 3, 95, 1],
    temperature_2m_max: [32, 30, 31, 29, 33],
    temperature_2m_min: [25, 24, 25, 24, 26],
    precipitation_probability_max: [20, 75, 30, 85, 10],
  },
};

const searchForm = document.querySelector("#search-form");
const searchControls = document.querySelector("#search-controls");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status");
const locationOptions = document.querySelector("#location-options");
const locationList = document.querySelector("#location-list");
const weatherSection = document.querySelector("#weather");
const forecastContainer = document.querySelector("#forecast");
const celsiusButton = document.querySelector("#celsius-button");
const fahrenheitButton = document.querySelector("#fahrenheit-button");

let temperatureUnit = "C";
let selectedLocation = null;
let weatherData = null;

async function searchCities(query) {
  // TODO STUDENTS: Search for cities using the Open-Meteo Geocoding API.
  // Endpoint: https://geocoding-api.open-meteo.com/v1/search
  // Query parameters: name (query), count (5), language (en), format (json).
  // Build a URL using URL and URLSearchParams, then call fetch().
  // Check response.ok before parsing the response with response.json().
  // Return the results array, or an empty array when there are no matches.
  // Throw an Error with a helpful message if the request fails.
}

async function fetchWeather(location) {
  // TODO STUDENTS: Get weather using location.latitude and location.longitude.
  // Endpoint: https://api.open-meteo.com/v1/forecast
  // Request the current and daily fields shown in DEMO_WEATHER above.
  // Set timezone=auto, forecast_days=5, temperature_unit=celsius,
  // and wind_speed_unit=kmh. See README.md for the full parameter checklist.
  // Check response.ok, parse the JSON, and return the weather object.
  // Throw an Error with a helpful message if the request fails.
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  searchControls.disabled = isLoading;
  locationOptions.disabled = isLoading;
  searchForm.setAttribute("aria-busy", String(isLoading));
}

function formatTemperature(value) {
  if (value === null || value === undefined) return "—";
  const temperature = temperatureUnit === "F" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(temperature)}°${temperatureUnit}`;
}

function formatMeasurement(value, unit) {
  return value === null || value === undefined ? "—" : `${value}${unit}`;
}

function describeWeather(code, isDay = true) {
  if (code === 0) return { label: isDay ? "Clear sky" : "Clear night", icon: isDay ? "☀️" : "🌙" };
  if (code === 1) return { label: "Mainly clear", icon: isDay ? "🌤️" : "🌙" };
  if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "🌫️" };
  if ([51, 53, 55].includes(code)) return { label: "Drizzle", icon: "🌦️" };
  if ([56, 57, 66, 67].includes(code)) return { label: "Freezing rain", icon: "🌧️" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", icon: "🌨️" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorms", icon: "⛈️" };
  return { label: "Conditions unavailable", icon: "🌡️" };
}

function formatLocalDate(dateString, options) {
  // API times are already city-local. UTC here preserves those digits instead
  // of shifting them into the viewer's timezone (or across a DST boundary).
  const date = new Date(`${dateString.length === 10 ? `${dateString}T12:00` : dateString}Z`);
  return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(date);
}

function locationLabel(location) {
  return [...new Set([location.name, location.admin1, location.country].filter(Boolean))].join(", ");
}

function renderWeather() {
  const current = weatherData.current;
  const condition = describeWeather(current.weather_code, current.is_day === 1);

  document.querySelector("#location-name").textContent = selectedLocation.name;
  document.querySelector("#location-region").textContent = [selectedLocation.admin1, selectedLocation.country]
    .filter((part) => part && part !== selectedLocation.name).join(", ");
  document.querySelector("#weather-time").textContent = `${USE_DEMO_DATA ? "Sample observation" : "Updated"} · ${formatLocalDate(current.time, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })} (${weatherData.timezone})`;
  document.querySelector("#temperature").textContent = formatTemperature(current.temperature_2m);
  document.querySelector("#condition").textContent = condition.label;
  document.querySelector("#weather-icon").textContent = condition.icon;
  document.querySelector("#feels-like").textContent = `Feels like ${formatTemperature(current.apparent_temperature)}`;
  document.querySelector("#humidity").textContent = formatMeasurement(current.relative_humidity_2m, "%");
  document.querySelector("#wind").textContent = formatMeasurement(current.wind_speed_10m, " km/h");
  document.querySelector("#rain-chance").textContent = formatMeasurement(weatherData.daily.precipitation_probability_max[0], "%");

  renderForecast();
  weatherSection.hidden = false;
}

function renderForecast() {
  const daily = weatherData.daily;
  forecastContainer.replaceChildren();

  daily.time.slice(0, 5).forEach((date, index) => {
    const condition = describeWeather(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = "forecast-card";

    const heading = document.createElement("h3");
    heading.textContent = formatLocalDate(date, { weekday: "short", day: "numeric" });

    const icon = document.createElement("span");
    icon.className = "forecast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = condition.icon;

    const description = document.createElement("p");
    description.className = "forecast-description";
    description.textContent = condition.label;

    const temperatures = document.createElement("p");
    temperatures.className = "forecast-temperatures";
    const high = document.createElement("strong");
    high.textContent = formatTemperature(daily.temperature_2m_max[index]);
    high.setAttribute("aria-label", `High ${high.textContent}`);
    const low = document.createElement("span");
    low.textContent = formatTemperature(daily.temperature_2m_min[index]);
    low.setAttribute("aria-label", `Low ${low.textContent}`);
    temperatures.append(high, low);

    const rain = document.createElement("p");
    rain.className = "forecast-rain";
    rain.textContent = `Rain: ${formatMeasurement(daily.precipitation_probability_max[index], "%")}`;

    card.append(heading, icon, description, temperatures, rain);
    forecastContainer.append(card);
  });
}

function renderLocations(locations) {
  locationList.replaceChildren();
  locations.forEach((location) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = locationLabel(location);
    button.addEventListener("click", () => loadWeather(location));
    item.append(button);
    locationList.append(item);
  });
  locationOptions.hidden = false;
}

async function handleSearch(event) {
  event.preventDefault();
  const query = cityInput.value.trim();
  if (!query) {
    setStatus("Please enter a city name.", true);
    cityInput.focus();
    return;
  }

  setLoading(true);
  setStatus("Looking for cities…");
  locationOptions.hidden = true;

  try {
    const locations = USE_DEMO_DATA
      ? [DEMO_LOCATION].filter((location) => location.name.toLowerCase().includes(query.toLowerCase()))
      : await searchCities(query);

    if (!Array.isArray(locations)) {
      throw new Error("Complete searchCities() so it returns an array of locations.");
    }
    if (locations.length === 0) {
      setStatus(USE_DEMO_DATA ? "No sample city found. Try Kuala Lumpur." : "No cities found. Try another name.");
      return;
    }
    renderLocations(locations);
    setStatus("Choose a location below to see its weather.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function loadWeather(location) {
  setLoading(true);
  setStatus(`Loading weather for ${location.name}…`);

  try {
    const data = USE_DEMO_DATA ? DEMO_WEATHER : await fetchWeather(location);
    if (!data?.current || !data?.daily) {
      throw new Error("Complete fetchWeather() so it returns current and daily weather data.");
    }
    selectedLocation = location;
    weatherData = data;
    renderWeather();
    locationOptions.hidden = true;
    setStatus(`${USE_DEMO_DATA ? "Sample weather" : "Weather"} loaded for ${locationLabel(location)}.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
}

function changeUnit(unit) {
  temperatureUnit = unit;
  celsiusButton.setAttribute("aria-pressed", String(unit === "C"));
  fahrenheitButton.setAttribute("aria-pressed", String(unit === "F"));
  if (weatherData) renderWeather();
}

searchForm.addEventListener("submit", handleSearch);
celsiusButton.addEventListener("click", () => changeUnit("C"));
fahrenheitButton.addEventListener("click", () => changeUnit("F"));

document.querySelector("#demo-notice").hidden = !USE_DEMO_DATA;
loadWeather(DEMO_LOCATION);
