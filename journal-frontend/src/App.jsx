import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const App = () => {
    const [entries, setEntries] = useState([]);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [editingEntry, setEditingEntry] = useState(null);

    useEffect(() => {
        const fetchGeolocation = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, (error) => {
                console.error("Error fetching geolocation: ", error);
            });
        };

        fetchGeolocation();
        fetchEntries();
    }, []);

    const fetchWeatherData = async (latitude, longitude) => {
        const apiKey = 'dedafd540b2a42b815fac2d1ed17bae2';
        const apiUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(apiUrl);
            const weather = response.data.weather[0].description;
            const temperature = response.data.main.temp;
            return { weather, temperature };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return { weather: 'N/A', temperature: 'N/A' };
        }
    };

    const fetchEntries = async () => {
        try {
            const response = await axios.get('http://localhost:4000/');
            setEntries(response.data);
            setError(null)
        } catch (error) {
            console.error("Error fetching entries: ", error);
            setError('Failed to fetch entries')
        }
    };

    const addEntry = async () => {
        if (!description.trim()) {
            console.error("Description is required");
            return;
        }

        if (location.latitude === null || location.longitude === null) {
            console.error("Location not available");
            return;
        }

        try {
            const weatherData = await fetchWeatherData(location.latitude, location.longitude);

            const response = await axios.post('http://localhost:4000/', {
                date: new Date(date),
                description,
                latitude: location.latitude,
                longitude: location.longitude,
                weather: weatherData.weather,
                temperature: weatherData.temperature
            });

            setEntries([...entries, response.data]);
            setDescription('');
            setDate(dayjs().format('YYYY-MM-DD'));
        } catch (error) {
            console.error("Error adding entry: ", error);
        }
    };

    const deleteEntry = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/${id}`);
            setEntries(entries.filter(entry => entry.id !== id));
            setError(null)
        } catch (error) {
            console.error("Error deleting entry: ", error);
            setError('Failed to delete entry. try again')
        }
    };

    const updateEntry = async (id) => {
        
        if (!description.trim()) {
            console.error("Description is required");
            return;
        }

        try {
            const response = await axios.put(`http://localhost:4000/${id}`, {
                date: new Date(date),
                description,
            });

            setEntries(entries.map(entry => (entry.id === id ? response.data : entry)));

            setEditingEntry(null);
            setDescription('');
            setDate(dayjs().format('YYYY-MM-DD'));
        } catch (error) {
            console.error("Error updating entry: ", error);
        }
    };


    return (
        <container>
            <div className='main'>
                <h1>Weather Forcast Journal</h1>
                <div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <input
                        type="text"
                        value={description}
                        placeholder='Input your discription.....'
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {editingEntry ? (
                        <button onClick={() => updateEntry(editingEntry)}>Update Entry</button>
                    ) : (
                        <button onClick={addEntry}>Add Entry</button>
                    )}
                    <button onClick={fetchEntries}>View Enties</button>

                </div>
                <ul>
                    {entries.map((entry) => (
                        <li key={entry._id}>
                            {dayjs(entry.date).format('YYYY-MM-DD')} - {entry.description} - {entry.latitude}, {entry.longitude} - {entry.weather} - {entry.temperature}°C
                            <button onClick={() => updateEntry(entry.id)}>Update</button>
                            <button onClick={() => deleteEntry(entry.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </container>
    );
};

export default App;
