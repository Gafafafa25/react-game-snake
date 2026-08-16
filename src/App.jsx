import './App.css'
import Game from './components/./Game.jsx'
import MapBuilder from "./components/MapBuilder.jsx";
import {useState} from "react";
function App() {
    const [showMapBuilder, setShowMapBuilder] = useState(false)

    return (
        <>

            <button onClick={() => setShowMapBuilder(!showMapBuilder)} style={{color: '#4a90e2', margin: '5px'}}>Change map</button>
            {showMapBuilder ? <MapBuilder /> : <Game />}
        </>
    )
}

export default App
