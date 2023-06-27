const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
const messageText = document.querySelector("[data-messageText]");

const searchInput = document.querySelector("[data-searchInput]");

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      apiErrorContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      apiErrorContainer.classList.remove("active");
      getfromSessionStorage();
    }
  }
}

let currentTab = userTab;
const api_key = "48e090516c0243185b9736328bd8872e";
currentTab.classList.add("current-tab");
getfromSessionStorage();

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grantcontainer invisible
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  //API CALL
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
    );
    const data = await response.json();
    console.log(data);
    if (!data.sys) {
      throw data;
    }
    renderWeatherInfo(data);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    console.log(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    console.log("User - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "block";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

function renderWeatherInfo(weatherInfo) {
  //firstly,we have to fetch element

  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");
  const feel = document.querySelector("[data-weatherFeel]");

  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp}°C`;

  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
  feel.innerText = `Feels Like : ${weatherInfo?.main?.feels_like}°C`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.log("No geolaocation support available");
    grantAccessButton.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let cityName = searchInput.value;
  console.log(cityName);
  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`
    );
    const data = await response.json();

    if (!data.sys) {
      throw data;
    }
    renderWeatherInfo(data);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
  } catch (error) {
    console.log("User - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "block";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.style.display = "none";
  }
}
