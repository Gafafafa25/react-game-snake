import {useEffect, useState, useRef} from "react";

const cellSize = 30
const columns = 20
const rows = 10
const gameSpeed = 200
const initSnake = [{x: 7, y: 6}, {x: 6, y: 6}, {x: 5, y: 6}]
const initDirection = {dx: 1, dy: 0}
const compareCells = (cell1, cell2) => {
    return cell1.x === cell2.x && cell1.y === cell2.y
}
const isOutside = (head) => {
    return head.x < 0 || head.y < 0 || head.x >= columns || head.y >= rows
}
const createInitialState = () => {
    const walls = [{x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}]
    const food = {x: 4, y: 4} //todo: getRandom()
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
const getFreePoint = (currentState) => {
    let randomX, randomY
    let isTouchedTail = 0
    do {
        randomX = Math.floor(Math.random() * 13) + 2
        randomY = Math.floor(Math.random() * 13) + 2

        // для проверки попадания в хвост
        // randomX = snake[Math.floor(snake.length / 2)].x
        // randomY = snake[Math.floor(snake.length / 2)].y
        for (const {x, y} of currentState.snake) {
            if (randomX === x && randomY === y) {
                isTouchedTail = 1
            }
        }
    } while (isTouchedTail === 1 || randomX === currentState.food.x && randomY === currentState.food.y)
    return {x: randomX, y: randomY}
}

const getNextGameState = (currentState, direction) => {
    //todo: status if pause return currentState *
    const tmpHead = getNextHead(currentState.snake[0], direction)
    const tmpTail = currentState.snake[currentState.snake.length - 1]
    if (isOutside(tmpHead)) {
        // alert("gameOver")
        return {...currentState, status: "gameOver"}
    }
    if (tmpHead.x === tmpTail.x && tmpHead.y === tmpTail.y) {
        // alert("gameOver")
        return {...currentState, status: "gameOver"}
    }
    for (let i = 0; i < currentState.walls.length; i++) {
        if (tmpHead.x === currentState.walls[i].x && tmpHead.y === currentState.walls[i].y) {
            // alert("gameOver")
            return {...currentState, status: "gameOver"}
        }
    }
    const snake = [tmpHead, ...currentState.snake.slice(0, -1)] //todo: function new fruit! all new
    if (tmpHead.x === currentState.food.x && tmpHead.y === currentState.food.y) {
         const food = getFreePoint(currentState)
         // console.log(food, " food")
         const score = currentState.score + 1
            return {...currentState, snake: snake, food: food, score: score}
    }
    return {...currentState, snake: snake} // todo: add food, score and ...
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
        drawCell(ctx, part, 'black')
    }
    drawCell(ctx, state.food, 'red')
    for (let i = 0; i < state.walls.length; i++) {
        drawCell(ctx, state.walls[i], 'blue')
    }
}

const keyToDirection = {
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
    ArrowLeft: {dx: -1, dy: 0},
    ArrowRight: {dx: 1, dy: 0}
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            const newDirection = keyToDirection[e.key]
            if (!newDirection) {
                return
            }
            e.preventDefault()
            setGameState((gameState) => {
                if (directionRef.current.dx + newDirection.dx === 0 ||
                    directionRef.current.dy + newDirection.dy === 0) {
                    return gameState
                }
                console.log("+")
                directionRef.current = newDirection
                return {...gameState, direction: newDirection}
            })
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <section>
            <h1 className="text-green-600">Snake</h1>
            <h2>Score: {gameState.score}</h2>
            {/*<div>*/}
            {/*    /!*<input type="checkbox" id="option1" checked={strictMode} onChange={changeMode}/>*!/*/}
            {/*    <label htmlFor="option1"> Strict boundaries</label>*/}
            {/*</div>*/}
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={columns * cellSize}
                    height={rows * cellSize}/>
        </section>
    )
}

export default Game