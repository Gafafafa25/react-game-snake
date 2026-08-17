import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Game from "./components/Game.jsx";
import MapBuilder from "./components/MapBuilder.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<App />*/}
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            {/*<Route path="/" element={<App />} />*/}
            <Route index element={<Game />} />
            <Route path='/mapBuilder' element={<MapBuilder />} />
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
