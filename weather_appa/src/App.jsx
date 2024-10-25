import React from "react";
import './index.css';  // Ensure this contains your global styles
import WeatherCard from './components/WeatherCard';  // Import the WeatherCard component

const App = () => {
  return (
    <div className="App">
      {/* Render WeatherCard component */}
      <WeatherCard />
    </div>
  );
};

export default App;
