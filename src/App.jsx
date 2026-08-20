import './App.css'
import Game from './components/./Game.jsx'
import MapBuilder from "./components/MapBuilder.jsx";
import {BrowserRouter, NavLink, Route, Routes, Link} from "react-router-dom";

function App() {

    return (
        <BrowserRouter>
            <nav>
                <NavLink to='/'>Main </NavLink>
                <NavLink to='/mapBuilder'>MapBuilder</NavLink>
            </nav>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route index element={<Game/>}/>
                <Route path='/mapBuilder' element={<MapBuilder/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
