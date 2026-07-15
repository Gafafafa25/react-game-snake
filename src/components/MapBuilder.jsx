import {useEffect, useRef, useState} from "react";

const CELLSIZE = 30
const COLUMNS = 20
const ROWS = 10

const drawGrid = (ctx) => {
    ctx.beginPath()
    for (let x = 0; x < CELLSIZE * COLUMNS; x += CELLSIZE) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, ROWS * CELLSIZE)
    }
    for (let y = 0; y < CELLSIZE * ROWS; y += CELLSIZE) {
        ctx.moveTo(0, y)
        ctx.lineTo(COLUMNS * CELLSIZE, y)
    }
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.stroke()
}

const drawCell = (canvas, cell, color) => {
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(cell.x * CELLSIZE, cell.y * CELLSIZE, CELLSIZE, CELLSIZE)
}

const renderGame = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx)
}


const MapBuilder = () => {
    const canvasRef = useRef(null)
    const [walls, setWalls] = useState(Array(COLUMNS).fill().map(() => Array(ROWS).fill('')))

    useEffect(() => {
        renderGame(canvasRef.current)
    }, [walls])

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()

        const x = e.clientX - rect.left //current x
        const y = e.clientY - rect.top //current y

        const col = Math.floor(x / CELLSIZE) //current col
        const row = Math.floor(y / CELLSIZE) //current row
        console.log(row, "row")
        console.log(col, "col")

        if (col >= 0 && col < CELLSIZE && row >= 0 && row < CELLSIZE) {
            setWalls((prevWalls) => { //switch color
                const newWalls = [...prevWalls]
                console.log(newWalls, " newWalls")
                console.log(newWalls[row][col], "newWalls[row][col]")
                newWalls[row][col] = newWalls[row][col] === 'red' ? '' : 'red'
                if (newWalls[col][col] === '') {
                    newWalls[row][col] = 'red'
                    console.log(" ++")
                    drawCell(canvasRef.current, {x: row, y: col}, 'red')
                }
                else {
                    console.log("---")
                    newWalls[row][col] = ''
                    drawCell(canvasRef.current, {x: row, y: col}, 'white')
                }
                return newWalls
            })
        }
    };

    return (
        <section className="map">
            <canvas className="border-2 border-gray-800 rounded lg"
                    ref={canvasRef}
                    width={COLUMNS * CELLSIZE}
                    height={ROWS * CELLSIZE}
                    onClick={handleClick}
            />
        </section>
    )
}
export default MapBuilder