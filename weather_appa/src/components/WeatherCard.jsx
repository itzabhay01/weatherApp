import React, { useState, useEffect } from 'react';
import './card.css';
import search_icon from '../assets/search.png';
import snow_icon from '../assets/snow.png';
import drizzle_icon from '../assets/drizzle.png';
import cloud_icon from '../assets/cloud.png';
import rain_icon from '../assets/rain.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';
import clear_icon from '../assets/clear.png';
import axios from 'axios';

const WeatherCard = () => {
    const [city, setCity] = useState("");
    const [temperature, setTemperature] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [windSpeed, setWindSpeed] = useState(null);
    const [minThreshold, setMinThreshold] = useState(null); // State for minimum threshold
    const [maxThreshold, setMaxThreshold] = useState(null); // State for maximum threshold
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [exceededThreshold, setExceededThreshold] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(clear_icon);
    const [errorMessage, setErrorMessage] = useState("");
    const [backgroundImage, setBackgroundImage] = useState('linear-gradient(45deg, #2f4680, #500ae4)');
    const [weatherCondition, setWeatherCondition] = useState(""); // New state for weather condition
    const API_KEY =  import.meta.env.VITE_API_KEY;

    const backgroundImages = {
        Clear: 'linear-gradient(to right, #f3b87c, #fcd283)',
        Clouds: 'linear-gradient(to right, #57d6d4, #7leec)',
        Rain: 'linear-gradient(to right, #5bc8fb, #80eaff)',
        Snow: 'linear-gradient(to right, #aff2ff, #fff)',
        Haze: 'linear-gradient(to right, #57d6d4, #71eeec)',
        Mist: 'linear-gradient(to right, #57d6d4, #7leec)',
    };

    useEffect(() => {
        if (!("Notification" in window)) {
            alert("This browser does not support notifications.");
        } else {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    setNotificationsEnabled(true);
                }
            });
        }
    }, []);

    const fetchWeatherData = async (city) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            setTemperature(response.data.main.temp);
            setHumidity(response.data.main.humidity);
            setWindSpeed(response.data.wind.speed);
            const weatherCondition = response.data.weather[0].main;
            setWeatherCondition(weatherCondition); // Set the dominant weather condition
            setWeatherIcon(getWeatherIcon(weatherCondition));
            setBackgroundImage(backgroundImages[weatherCondition] || backgroundImages.Clear);
            return response.data.main.temp;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErrorMessage("City not found.\nPlease enter a valid city name.");
            } else {
                setErrorMessage("Error fetching weather data.\nPlease try again later.");
            }
            console.error("Error fetching weather data:", error);
            return null;
        }
    };

    const getWeatherIcon = (condition) => {
        switch (condition) {
            case 'Clear':
                return clear_icon;
            case 'Clouds':
                return cloud_icon;
            case 'Rain':
                return rain_icon;
            case 'Drizzle':
                return drizzle_icon;
            case 'Snow':
                return snow_icon;
            case 'Wind':
                return wind_icon;
            default:
                return clear_icon;
        }
    };

    const notifyUser = (message) => {
        if (notificationsEnabled) {
            new Notification("Weather Update", {
                body: message,
            });
        }
    };

    const checkTemperature = async () => {
        if (!city) return;
    
        const currentTemp = await fetchWeatherData(city);
        console.log(
            `Checked temperature at ${new Date().toLocaleTimeString()}. Current Temp: ${currentTemp}°C, Min Threshold: ${minThreshold}°C, Max Threshold: ${maxThreshold}°C`
        );
    
        if (currentTemp !== null) {
            notifyUser(`The current temperature in ${city} is ${currentTemp}°C.`);

            if (minThreshold !== null && maxThreshold !== null) {
                if (currentTemp < minThreshold) {
                    console.log(
                        `Temperature below minimum threshold! Current Temp: ${currentTemp}°C, Min Threshold: ${minThreshold}°C`
                    );
                    notifyUser(
                        `Alert! The current temperature in ${city} is below your minimum threshold of ${minThreshold}°C.`
                    );
                    setExceededThreshold("below min");
                } else if (currentTemp > maxThreshold) {
                    console.log(
                        `Temperature exceeded maximum threshold! Current Temp: ${currentTemp}°C, Max Threshold: ${maxThreshold}°C`
                    );
                    notifyUser(
                        `Alert! The current temperature in ${city} has exceeded your maximum threshold of ${maxThreshold}°C.`
                    );
                    setExceededThreshold("above max");
                } else {
                    console.log(`Temperature is within the threshold.`);
                    setExceededThreshold("within range");
                }
            } else {
                setExceededThreshold(null);
            }
        }
    };

    const handleSearch = async () => {
        await fetchWeatherData(city);
        startMonitoring();
    };

    const startMonitoring = () => {
        if (intervalId) clearInterval(intervalId);

        const id = setInterval(() => {
            checkTemperature();
        }, 60 * 1000);

        setIntervalId(id);
    };

    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    return (
        <div className='weather' style={{ background: backgroundImage }}>
            <div className='search-bar'>
                <input
                    type='text'
                    placeholder='Search city'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <img src={search_icon} alt='Search Icon' onClick={handleSearch} />
            </div>

            {temperature !== null && (
                <>
                    <img src={weatherIcon} alt='Weather Icon' className='weather-icon' />
                    
                    {/* Display Temperature */}
                    <p className='temperature'>{temperature}°C</p>
                    <p className='location'>{city}</p>
                    
                    {/* Display Weather Condition */}
                    <p className='weather-condition'>{weatherCondition}</p>

                    <div className='weather-data'>
                        <div className='col'>
                            <img src={humidity_icon} alt='Humidity Icon' />
                            <div>
                                <p>{humidity}%</p>
                                <span>Humidity</span>
                            </div>
                        </div>
                        <div className='col'>
                            <img src={wind_icon} alt='Wind Speed Icon' />
                            <div>
                                <p>{windSpeed} m/s</p>
                                <span>Wind Speed</span>
                            </div>
                        </div>
                    </div>

                    <div className="threshold">
                        <input
                            type="number"
                            placeholder="Min threshold temperature"
                            value={minThreshold !== null ? minThreshold : ""}
                            onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            
                        />
                        <input
                            type="number"
                            placeholder="Max threshold temperature"
                            value={maxThreshold !== null ? maxThreshold : ""}
                            onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <span>Set minimum and maximum temperature thresholds for notifications.</span>
                    </div>

                    {exceededThreshold && (
                        <p className='threshold-message'>
                            {exceededThreshold === "below min" 
                                ? `The current temperature is below the minimum threshold of ${minThreshold}°C!` 
                                : exceededThreshold === "above max"
                                ? `The current temperature has exceeded the maximum threshold of ${maxThreshold}°C!`
                                : "Temperature is within the acceptable range."}
                        </p>
                    )}

                    {notificationsEnabled ? (
                        <p className="notification-message">Notifications are enabled!</p>
                    ) : (
                        <p className="notification-message">Please allow notifications to get updates.</p>
                    )}

                    {errorMessage && (
                        <div className='error-message'>
                            <p>{errorMessage.split('\n')[0]}</p>
                            <p>{errorMessage.split('\n')[1]}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WeatherCard;
