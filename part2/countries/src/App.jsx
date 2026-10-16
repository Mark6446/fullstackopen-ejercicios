import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null)
  const api_key = import.meta.env.VITE_SOME_KEY

  useEffect(() => {
    if (api_key) {
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${api_key}&units=metric`)
        .then(response => {
          setWeather(response.data)
        })
    }
  }, [capital, api_key])

  if (!weather) return null

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p>temperature {weather.main.temp} Celcius</p>
      <img 
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
        alt={weather.weather[0].description} 
      />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  )
}

const CountryDetails = ({ country }) => {
  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>capital {country.capital[0]}</p>
      <p>area {country.area}</p>
      
      <h3>languages:</h3>
      <ul>
        {Object.values(country.languages).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />
      
      <Weather capital={country.capital[0]} />
    </div>
  )
}

const App = () => {
  const [search, setSearch] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null) // Resetea el país seleccionado si el usuario sigue escribiendo
  }

  const filteredCountries = countries.filter(country => 
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div>
        find countries <input value={search} onChange={handleSearchChange} />
      </div>

      {/* Lógica de renderizado condicional */}
      {selectedCountry ? (
        <CountryDetails country={selectedCountry} />
      ) : (
        <div>
          {filteredCountries.length > 10 && search.length > 0 && (
            <p>Too many matches, specify another filter</p>
          )}
          
          {filteredCountries.length <= 10 && filteredCountries.length > 1 && (
            filteredCountries.map(country => (
              <div key={country.name.common}>
                {country.name.common} 
                <button onClick={() => setSelectedCountry(country)}>show</button>
              </div>
            ))
          )}

          {filteredCountries.length === 1 && (
            <CountryDetails country={filteredCountries[0]} />
          )}
        </div>
      )}
    </div>
  )
}

export default App