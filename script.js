const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemContainer = document.querySelector('.forecast-item-container');
const CONFIG = {
    apiKey: 'edc1e73fc4cd43ed1bd9eff1700bd81e'
};

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endPoint, city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${CONFIG.apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return { cod: 404 };
    }
}

function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.png';
    if (id >= 300 && id <= 321) return 'drizzle.png';
    if (id >= 500 && id <= 531) return 'rain.png';
    if (id >= 600 && id <= 622) return 'snowy.png';
    if (id >= 701 && id <= 781) return 'atmosphere.png';
    if (id === 800) return 'sunny.png';
    if (id >= 801 && id <= 804) return 'cloud.png';
    return 'default.png';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-US', options);
}

async function updateWeatherInfo(city) {
    searchBtn.disabled = true;
    // Change to loading spinner
    searchBtn.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const weatherData = await getFetchData('weather', city);

        if (weatherData.cod !== 200) {
            const errorMessage = document.querySelector('.error-message');
            errorMessage.textContent = `The city "${city}" could not be found`;
            showDisplaySection(notFoundSection);
            return;
        }

        // Update weather info (rest of your existing code)
        const {
            name: cityName,
            sys: { country },
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData;

        countryTxt.textContent = `${cityName}, ${country}`;
        tempTxt.textContent = `${Math.round(temp)}°C`;
        conditionTxt.textContent = main;
        humidityValueTxt.textContent = `${humidity}%`;
        windValueTxt.textContent = `${speed} M/s`;
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `${getWeatherIcon(id)}`;

        await updateForecastInfo(city);
        showDisplaySection(weatherInfoSection);

    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.querySelector('.error-message');
        errorMessage.textContent = `Failed to fetch weather data. Please try again.`;
        showDisplaySection(notFoundSection);
    } finally {
        // Reset button state
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<img src="search.png" alt="search" height="25" width="25">';
    }
}

async function updateForecastInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    forecastItemContainer.innerHTML = '';

    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `;
    forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
