import {useEffect, useState, useRef} from "react";

const CELLSIZE = 30
const COLUMNS = 20
const ROWS = 10
const GAMESPEED = 200
const INITSNAKE = [{x: 7, y: 6}, {x: 6, y: 6}, {x: 5, y: 6}]
const INITDIRECTION = {dx: 1, dy: 0}
const compareCells = (cell1, cell2) => {
    return cell1.x === cell2.x && cell1.y === cell2.y
}
const isOutside = (head) => {
    return head.x < 0 || head.y < 0 || head.x >= COLUMNS || head.y >= ROWS
}
const createInitialState = () => {
    const WALLS = [{x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}]
    const FOOD = {x: 4, y: 4}
    const FOODX2 = {x: 8, y: 8}
    const FOODX2COUNT = 0

    return {
        snake: INITSNAKE,
        walls: WALLS,
        food: FOOD,
        foodX2: FOODX2,
        foodX2Count: FOODX2COUNT,
        direction: INITDIRECTION,
        score: 0,
        strictMode: false,
        status: "active"
    }
}
const getNextHead = (head, direction, strictMode) => {
    const nextHead = {x: head.x + direction.dx, y: head.y + direction.dy}
    if (strictMode === false && isOutside(nextHead)) {
        if (direction.dx === 1 && direction.dy === 0) {
            return {x: 0, y: nextHead.y}
        }
        if (direction.dx === -1 && direction.dy === 0) {
            return {x: COLUMNS - 1, y: nextHead.y}
        }
        if (direction.dx === 0 && direction.dy === 1) {
            return {x: nextHead.x, y: 0}
        }
        if (direction.dx === 0 && direction.dy === -1) {
            return {x: nextHead.x, y: ROWS - 1}
        }
    }
    return {x: head.x + direction.dx, y: head.y + direction.dy}
}
const getEmptyCell = (currentState) => {
    let randomX, randomY
    let isTouchedTail = 0
    let isTouchedWall = 0
    let isTouchedFood = 0
    let isTouchedFoodX2 = 0
    do {
        console.log("!")
        isTouchedTail = 0
        isTouchedWall = 0
        isTouchedFood = 0
        isTouchedFoodX2 = 0

        randomX = Math.floor(Math.random() * (COLUMNS - 3)) + 2
        randomY = Math.floor(Math.random() * (ROWS - 3)) + 2

        // для проверки попадания в хвост
        // randomX = snake[Math.floor(snake.length / 2)].x
        // randomY = snake[Math.floor(snake.length / 2)].y
        for (const {x, y} of currentState.snake) {
            if (randomX === x && randomY === y) {
                isTouchedTail = 1
                break
                // alert(randomX, randomY)
                // alert("here")
            }
        }
        for (const {x, y} of currentState.walls) {
            if (randomX === x && randomY === y) {
                isTouchedWall = 1
                break
                // alert(randomX, randomY)
                // alert("here")
            }
        }
        if (randomX === currentState.food.x && randomY === currentState.food.y) {
            isTouchedFood = 1
            break
        }
        if (randomX === currentState.foodX2.x && randomY === currentState.foodX2.y) {
            isTouchedFoodX2 = 1
            break
        }
    } while (isTouchedTail === 1 || isTouchedWall === 1 || isTouchedFood === 1 || isTouchedFoodX2 === 1)
    return {x: randomX, y: randomY}
}

const getNextGameState = (currentState, direction) => {
    const tmpHead = getNextHead(currentState.snake[0], direction, currentState.strictMode)
    const tmpTail = currentState.snake[currentState.snake.length - 1]

    if (isOutside(tmpHead) && currentState.strictMode === true) {
        // alert("gameOver")
        return {...currentState, status: "gameOver"}
    }
    // if (isOutside(tmpHead) && currentState.strictMode === false) {
    //     // alert("gameOver")
    //     return {...currentState}
    // }// fix update tmpHead
    if (compareCells(tmpHead, tmpTail)) {
        // alert("gameOver")
        return {...currentState, status: "gameOver"}
    }
    for (let i = 0; i < currentState.walls.length; i++) {
        if (compareCells(tmpHead, currentState.walls[i])) {
            // alert("gameOver")
            return {...currentState, status: "gameOver"}
        }
    }
    const snake = [tmpHead, ...currentState.snake.slice(0, -1)]
    if (compareCells(tmpHead, currentState.food) || currentState.foodX2Count > 0) {
        const food = getEmptyCell(currentState)
        console.log(food, " food")
        const score = currentState.score + 1
        const snake = [tmpHead, ...currentState.snake]
        // const snakeNew = []
        return {...currentState, snake: snake, food: food, score: score, foodX2Count: currentState.foodX2Count - 1}
    }
    if (compareCells(tmpHead, currentState.foodX2)) {
        const foodX2 = getEmptyCell(currentState)
        console.log(foodX2, " foodX2")
        const score = currentState.score * 2
        const snake = [tmpHead, ...currentState.snake]
        return {...currentState, snake: snake, foodX2: foodX2, score: score, foodX2Count: 5}
    }
    return {...currentState, snake: snake}
}
const drawCell = (ctx, cell, color) => {
    ctx.fillStyle = color
    ctx.fillRect(cell.x * CELLSIZE, cell.y * CELLSIZE, CELLSIZE, CELLSIZE)
}
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
const drawEyes = (ctx, head, direction) => {
    // const eyeSize = size / 4
    // const pupilSize = eyeSize / 2
    // const leftEye = {x: head.x + size - eyeSize * 1.5, y: head.y}
    ctx.fillStyle = 'black'
    ctx.fillRect(head.x * CELLSIZE, head.y * CELLSIZE, CELLSIZE, CELLSIZE)

    let directionKey = ""
    if (compareCells(direction, {dx: 1, dy: 0})) {
        directionKey = "Right"
    } else if (compareCells(direction, {dx: -1, dy: 0})) {
        directionKey = "Left"
    } else if (compareCells(direction, {dx: 0, dy: -1})) {
        directionKey = "Up"
    }
    else if (compareCells(direction, {dx: 0, dy: 1})) {
        directionKey = "Down"
    }
    const params = d[directionKey]
    console.log(params, " params")
    console.log(directionKey, " directionKey")




    // Левый глаз (нижний левый угол головы)
    ctx.fillStyle = 'green'
    ctx.beginPath();
    ctx.arc(head.x * CELLSIZE + params.dx1, head.y * CELLSIZE + params.dy1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Правый глаз (верхний правый угол головы)
    ctx.fillStyle = 'green'
    ctx.beginPath();
    ctx.arc(head.x * CELLSIZE + params.dx2, head.y * CELLSIZE + params.dy2, 3, 0, Math.PI * 2);
    ctx.fill();
}

const renderGame = (canvas, state) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx)
    // for (let part of state.snake) {
    //     drawCell(ctx, part, 'black')
    // }
    for (let i = 0; i < state.snake.length; i++) {
        if (i === 0) {
            drawEyes(ctx, state.snake[i], state.direction)
        } else {
            drawCell(ctx, state.snake[i], 'black')
        }
    }
    drawCell(ctx, state.food, 'red')
    for (let i = 0; i < state.walls.length; i++) {
        drawCell(ctx, state.walls[i], 'blue')
    }
    drawCell(ctx, state.foodX2, 'green')
}


const d = { //todo: scale size //directionKey error - everytime Initial state (Right)
    Up: {dx1: 25, dy1: 45, dx2: 45, dy2: 10},
    Down: {dx1: 5, dy1: 5, dx2: 0, dy2: -1},
    Left: {dx1: 5, dy1: 5, dx2: 0, dy2: -1},
    Right: {dx1: 5, dy1: 5, dx2: 5, dy2: 20}
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
    const directionRef = useRef(INITDIRECTION)
    // const directionRef = useRef(initDirection) //todo: directionRef2


    useEffect(() => { //main
        const intervalId = setInterval(() => {
            setGameState((currentGameState) => {
                if (currentGameState.status === "pause") {
                    return currentGameState
                }
                return getNextGameState(currentGameState, directionRef.current)
            })
        }, GAMESPEED)
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
            console.log(e.code, " key")
            if (e.code === "Space") {
                setGameState((gameState) => {
                    return {...gameState, status: gameState.status === "active" ? "pause" : "active"}
                })
                return
            }
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
            <h2>Status: {gameState.status}</h2>
            <div>
                <input type="checkbox" id="option1" checked={gameState.strictMode}
                       onChange={() => setGameState(gameState => ({...gameState, strictMode: !gameState.strictMode}))}/>
                <label htmlFor="option1"> Strict boundaries</label>
            </div>
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={COLUMNS * CELLSIZE}
                    height={ROWS * CELLSIZE}/>
        </section>
    )
}

export default Game