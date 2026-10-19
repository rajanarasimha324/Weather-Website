// Selecting HTML elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const messageDiv = document.getElementById('message');
const weatherCard = document.getElementById('weatherCard');
const cityNameDisplay = document.getElementById('cityName');
const temperatureDisplay = document.getElementById('temperature');
const conditionDisplay = document.getElementById('condition');
const windSpeedDisplay = document.getElementById('windSpeed');

// Event listener for the search button click
searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName === '') {
        showError('Please enter a city name.');
        return;
    }
    getWeather(cityName);
});

// Main asynchronous function to fetch weather data
async function getWeather(city) {
    try {
        // Show loading message and hide old weather card
        messageDiv.textContent = 'Loading weather data...';
        weatherCard.classList.add('hidden');

        // Step 1: Convert city name to Latitude and Longitude using Open-Meteo Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        // Check if the city was found
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found. Please check the spelling.');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Fetch current weather using Latitude and Longitude
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data from server.');
        }

        const weatherData = await weatherResponse.json();

        // Step 3: Display the fetched data on the UI
        displayWeather(name, country, weatherData.current_weather);

    } catch (error) {
        // Handle any errors that occurred during the process
        showError(error.message);
    }
}
function getWeatherCondition(code) {
    if (code === 0) {
        return "Clear sky";
    } else if (code === 1) {
        return "Mainly clear";
    } else if (code === 2) {
        return "Partly cloudy";
    } else if (code === 3) {
        return "Overcast";
    } else if (code === 45 || code === 48) {
        return "Foggy";
    } else if (code >= 51 && code <= 57) {
        return "Light drizzle";
    } else if (code >= 61 && code <= 67) {
        return "Rain";
    } else if (code >= 71 && code <= 77) {
        return "Snowfall";
    } else if (code >= 80 && code <= 82) {
        return "Rain showers";
    } else if (code >= 95 && code <= 99) {
        return "Thunderstorm";
    } else {
        return "Unknown weather condition";
    }
}
// Function to update the DOM with weather details
function displayWeather(city, country, current) {
    messageDiv.textContent = '';
    cityNameDisplay.textContent = `${city}, ${country || ''}`;
    temperatureDisplay.textContent =
        `Temperature: ${current.temperature} °C`;

    conditionDisplay.textContent =
        `Condition: ${getWeatherCondition(current.weathercode)}`;

    windSpeedDisplay.textContent =
        `Wind Speed: ${current.windspeed} km/h`;

    weatherCard.classList.remove('hidden');
}

// Helper function to display error messages
function showError(message) {
    messageDiv.textContent = message;
    weatherCard.classList.add('hidden');
}