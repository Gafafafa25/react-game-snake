import './App.css'
import Game from './components/./Game.jsx'
import MapBuilder from "./components/MapBuilder.jsx";
import {useState} from "react";
function App() {
    const [showMapBuilder, setShowMapBuilder] = useState(false)

    return (
        <>
            <button onClick={() => setShowMapBuilder(!showMapBuilder)}>Change map</button>
            {showMapBuilder ? <MapBuilder /> : <Game />}
            {/*<Game/>*/}
            {/*<MapBuilder/>*/}
        </>
    )
}

export default App
