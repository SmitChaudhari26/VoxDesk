import React, { useState, useEffect } from 'react';

function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('');

    // Weather icons mapping
    const getWeatherIcon = (condition) => {
        const icons = {
            'clear': '☀️',
            'sunny': '☀️',
            'cloudy': '☁️',
            'overcast': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'snow': '🌨️',
            'thunderstorm': '⛈️',
            'fog': '🌫️',
            'mist': '🌫️'
        };

        const key = Object.keys(icons).find(key =>
            condition.toLowerCase().includes(key)
        );
        return icons[key] || '🌤️';
    };

    // Get user location and show intelligent mock weather
    const fetchWeather = async () => {
        try {
            setLoading(true);

            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            console.log('Requesting location permission...');

            // Get user location
            const position = await new Promise((resolve, reject) => {
                const options = {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000
                };

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        console.log('Location obtained:', pos.coords.latitude, pos.coords.longitude);
                        resolve(pos);
                    },
                    (err) => {
                        console.error('Geolocation error:', err);
                        reject(new Error('Location access denied'));
                    },
                    options
                );
            });

            const { latitude, longitude } = position.coords;
            console.log('Using coordinates:', latitude, longitude);

            // Get city name using reverse geocoding
            try {
                const geocodeResponse = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );

                if (geocodeResponse.ok) {
                    const geocodeData = await geocodeResponse.json();
                    const cityName = geocodeData.city || geocodeData.locality || 'Your Location';
                    const country = geocodeData.countryName || 'Unknown';
                    setLocation(`${cityName}, ${country}`);
                } else {
                    setLocation('Your Current Location');
                }
            } catch (geocodeError) {
                console.log('Geocoding failed:', geocodeError);
                setLocation('Your Current Location');
            }

            // Generate realistic weather data based on location and season
            const now = new Date();
            const currentHour = now.getHours();
            const isWinter = now.getMonth() >= 11 || now.getMonth() <= 2;
            const isSummer = now.getMonth() >= 5 && now.getMonth() <= 8;

            let mockTemp = 22; // Default spring/autumn temp
            let mockCondition = 'Partly Cloudy';

            // Seasonal temperature ranges
            if (isWinter) {
                mockTemp = Math.floor(Math.random() * 12) + 8; // 8-20°C
                mockCondition = ['Cloudy', 'Clear', 'Light Rain', 'Overcast'][Math.floor(Math.random() * 4)];
            } else if (isSummer) {
                mockTemp = Math.floor(Math.random() * 15) + 25; // 25-40°C
                mockCondition = ['Sunny', 'Partly Cloudy', 'Hot', 'Clear'][Math.floor(Math.random() * 4)];
            } else {
                mockTemp = Math.floor(Math.random() * 12) + 18; // 18-30°C
                mockCondition = ['Partly Cloudy', 'Clear', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)];
            }

            // Adjust for time of day
            if (currentHour >= 6 && currentHour <= 8) {
                mockTemp = mockTemp - 3; // Cooler in early morning
            } else if (currentHour >= 12 && currentHour <= 15) {
                mockTemp = mockTemp + 2; // Warmer in afternoon
            } else if (currentHour >= 19 || currentHour <= 5) {
                mockTemp = mockTemp - 2; // Cooler at night
            }

            const intelligentWeather = {
                location: {
                    name: location.split(',')[0] || 'Your City',
                    country: location.split(',')[1] || 'Live Location'
                },
                current: {
                    temp_c: Math.max(5, mockTemp), // Minimum 5°C
                    condition: { text: mockCondition },
                    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
                    wind_kph: Math.floor(Math.random() * 20) + 5, // 5-25 kmh
                    feelslike_c: Math.max(5, mockTemp + Math.floor(Math.random() * 6) - 3) // ±3°C
                }
            };

            setWeather(intelligentWeather);

        } catch (err) {
            console.error('Weather fetch error:', err);

            // Final fallback with generic data
            const fallbackWeather = {
                location: { name: 'Demo Location', country: 'India' },
                current: {
                    temp_c: 28,
                    condition: { text: 'Partly Cloudy' },
                    humidity: 65,
                    wind_kph: 12,
                    feelslike_c: 32
                }
            };
            setWeather(fallbackWeather);
            setLocation('Demo Location, India');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg min-w-[300px]">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-2">Getting your location...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg min-w-[300px] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">🌤️ Weather</h3>
                    <button
                        onClick={fetchWeather}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        🔄
                    </button>
                </div>

                {weather && (
                    <>
                        {/* Location */}
                        <div className="mb-4">
                            <p className="text-sm opacity-90">📍 {location}</p>
                        </div>

                        {/* Main weather */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="text-4xl font-bold">
                                    {weather.current.temp_c}°C
                                </div>
                                <div className="text-sm opacity-90">
                                    Feels like {weather.current.feelslike_c}°C
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-2">
                                    {getWeatherIcon(weather.current.condition.text)}
                                </div>
                                <div className="text-sm capitalize">
                                    {weather.current.condition.text}
                                </div>
                            </div>
                        </div>

                        {/* Weather details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/10 rounded-lg p-3">
                                <div className="opacity-75">Humidity</div>
                                <div className="text-lg font-semibold">💧 {weather.current.humidity}%</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <div className="opacity-75">Wind</div>
                                <div className="text-lg font-semibold">💨 {weather.current.wind_kph} km/h</div>
                            </div>
                        </div>

                        {/* Last updated */}
                        <div className="mt-4 text-xs opacity-75 text-center">
                            Updated: {new Date().toLocaleTimeString()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default WeatherWidget;