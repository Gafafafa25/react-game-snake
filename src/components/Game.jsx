import {useEffect, useState, useRef} from "react";

const cellSize = 20
const columns = 20
const rows = 15
const gameSpeed = 200
const initSnake = [{x: 7, y: 6}, {x: 6, y: 6}, {x: 5, y: 6}]
const initDirection = [{dx: 1, dy: 0}]
const compareCells = (cell1, cell2) => {
    return cell1.x === cell2.x && cell1.y === cell2.y
}
const isOutside = (head) => {
    return head.x < 0 || head.y < 0 || head.x >= rows || head.y >= columns
}
const createInitialState = () => {
    const walls = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}]
    const food = [{x: 1, y: 4}] //todo: getRandom()
    return {
        snake: initSnake,
        walls: walls,
        food: food,
        direction: initDirection,
        score: 0,
        strictMode: false,
        status: "active"
    }
}
const getNextHead = (head, direction) => {
    return {x: head.x + direction.dx, y: head.y + direction.dy}
}
const getNextGameState = (currentState, direction) => {
    //todo: status if pause return currentState
    const tmpHead = getNextHead(currentState.snake[0], direction)
    if (isOutside(tmpHead)) {
        return {...currentState, status: "gameOver"}
    }
    //todo: if hit tail, walls
    //todo: check fruit(with tail)
    const snake = [tmpHead, currentState.snake.slice(0, -1)] //todo: new fruit! all new
    return {...currentState, snake: snake}
}
const drawCell = (ctx, cell, color) => {
    ctx.fillStyle = color
    ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize)
}
const drawGrid = (ctx) => {
    ctx.beginPath()
    for (let x = 0; x < cellSize * columns; x += cellSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rows * cellSize)
    }
    for (let y = 0; y < cellSize * rows; y += cellSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(columns * cellSize, y)
    }
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.stroke()
}
const renderGame = (canvas, state) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx)
    for (let part of state.snake) {
        drawCell(ctx, part, 'black') //todo: head has another color
    }
    //todo: draw fruit and walls
}

const Game = () => {
    const [gameState, setGameState] = useState(() => createInitialState())
    const canvasRef = useRef(null)
    const directionRef = useRef(initDirection)

    useEffect(() => { //main
        const intervalId = setInterval(() => {
            setGameState((currentGameState) => getNextGameState(currentGameState, directionRef.current))
        }, gameSpeed)
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        //if canvasRef.current
        renderGame(canvasRef.current, gameState)
    }, [gameState])

    return (
        <section>
            <h1 className="text-green-600">Snake</h1>
            {/*<h2>Score: {score}</h2>*/}
            {/*<div>*/}
            {/*    /!*<input type="checkbox" id="option1" checked={strictMode} onChange={changeMode}/>*!/*/}
            {/*    <label htmlFor="option1"> Strict boundaries</label>*/}
            {/*</div>*/}
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={500} height={400}/>
        </section>
    )
}

export default Game