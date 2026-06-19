import {useEffect, useState, useRef} from "react";

const CELLSIZE = 30
const COLUMNS = 20
const ROWS = 10
const GAMESPEED = 200
const INITSNAKE = [{x: 7, y: 6}, {x: 6, y: 6}, {x: 5, y: 6}]
const INITDIRECTION = {dx: 1, dy: 0}
// const WALLS = [{x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}]
const FOOD = {x: 4, y: 4}
const FOODX2 = {x: 8, y: 8}
const FOODX2COUNT = 0
const COLLISION = {x: -1, y: -1}
const LIVES = 3
const HEALTHBOX = 0
const ISHEALTHBOX = false
const HEALTHBOXTIME = 7
const WALLSMAP = [
    [{x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}],
    [{x: 2, y: 2}, {x: 2, y: 3}],
    [{x: 2, y: 2}]
]
const WALLMAPNUMBER = 0
const WALLS = WALLSMAP[WALLMAPNUMBER]

const compareCells = (cell1, cell2) => {
    return cell1.x === cell2.x && cell1.y === cell2.y
}
const compareDirections = (direction1, direction2) => {
    return direction1.dx === direction2.dx && direction1.dy === direction2.dy
}
const isOutside = (head) => {
    return head.x < 0 || head.y < 0 || head.x >= COLUMNS || head.y >= ROWS
}
const createInitialState = () => {
    return {
        snake: INITSNAKE,
        walls: WALLS,
        wallsMapNumber: WALLMAPNUMBER,
        food: FOOD,
        foodX2: FOODX2,
        foodX2Count: FOODX2COUNT,
        healthBox: HEALTHBOX,
        isHealthBox: ISHEALTHBOX,
        collision: COLLISION,
        isCollision: false,
        direction: INITDIRECTION,
        lives: LIVES,
        score: 0,
        strictMode: false,
        status: "active",
        statusColor: "green",
        hasMessage: false
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
            }
        }
        for (const {x, y} of currentState.walls) {
            if (randomX === x && randomY === y) {
                isTouchedWall = 1
                break
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
    // console.log(tmpHead, " tmpHead")
    if (isOutside(tmpHead) && currentState.strictMode === true) {
        return {
            ...currentState, isCollision: true, lives: currentState.lives - 1, status: "pause", statusColor: "blue",
            collision: tmpHead
        }
    }
    for (let i = 1; i < currentState.snake.length; i++) {
        if (compareCells(tmpHead, currentState.snake[i])) {
            return {
                ...currentState,
                isCollision: true,
                collision: tmpHead,
                lives: currentState.lives - 1,
                status: "pause",
                statusColor: "blue",
            }
        }
    }
    for (let i = 0; i < currentState.walls.length; i++) {
        if (compareCells(tmpHead, currentState.walls[i])) {
            return {
                ...currentState,
                isCollision: true,
                hasMessage: true, //todo: hasMessage, collision
                collision: tmpHead,
                lives: currentState.lives - 1,
                status: "pause",
                statusColor: "blue"
            }
        }
    }
    const snake = [tmpHead, ...currentState.snake.slice(0, -1)]
    //fruit collision
    if (compareCells(tmpHead, currentState.healthBox)) {
        return {
            ...currentState, snake: snake, score: currentState.score,
            direction: direction, lives: currentState.lives + 1, isHealthBox: false, collision: currentState.collision
        }
    }
    if (compareCells(tmpHead, currentState.food) || currentState.foodX2Count > 0 || compareCells(tmpHead, currentState.healthBox)) {
        const food = getEmptyCell(currentState)
        const score = currentState.score + 1
        const snake = [tmpHead, ...currentState.snake]
        return {
            ...currentState,
            snake: snake,
            food: food,
            score: score,
            foodX2Count: currentState.foodX2Count - 1,
            direction: direction,
            collision: currentState.collision
        }
    }
    if (compareCells(tmpHead, currentState.foodX2)) {
        const foodX2 = getEmptyCell(currentState)
        const score = currentState.score * 2
        const snake = [tmpHead, ...currentState.snake]
        return {
            ...currentState, snake: snake, foodX2: foodX2, score: score, foodX2Count: 5, direction: direction,
            collision: currentState.collision
        }
    }

    return {...currentState, snake: snake, direction: direction, collision: currentState.collision}
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
    let directionKey = ""
    if (compareDirections(direction, {dx: 1, dy: 0})) {
        directionKey = "Right"
    } else if (compareDirections(direction, {dx: -1, dy: 0})) {
        directionKey = "Left"
    } else if (compareDirections(direction, {dx: 0, dy: -1})) {
        directionKey = "Up"
    } else if (compareDirections(direction, {dx: 0, dy: 1})) {
        directionKey = "Down"
    }
    const params = d[directionKey]

    ctx.beginPath()
    ctx.arc(head.x * CELLSIZE + 15, head.y * CELLSIZE + 15, CELLSIZE / 2, 0, 2 * Math.PI)
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.closePath()

    // Левый глаз (нижний левый угол головы)
    ctx.fillStyle = 'yellow'
    ctx.beginPath();
    ctx.arc(head.x * CELLSIZE + params.dx1, head.y * CELLSIZE + params.dy1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Правый глаз (верхний правый угол головы)
    ctx.fillStyle = 'yellow'
    ctx.beginPath();
    ctx.arc(head.x * CELLSIZE + params.dx2, head.y * CELLSIZE + params.dy2, 3, 0, Math.PI * 2);
    ctx.fill();
}
const drawCross = (ctx, collision) => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    // Линия от верхнего левого к нижнему правому
    ctx.beginPath();
    ctx.moveTo(collision.x * CELLSIZE, collision.y * CELLSIZE);
    ctx.lineTo(collision.x * CELLSIZE + CELLSIZE, collision.y * CELLSIZE + CELLSIZE);
    ctx.stroke();

    // Линия от нижнего левого к верхнему правому
    ctx.beginPath();
    ctx.moveTo(collision.x * CELLSIZE + CELLSIZE, collision.y * CELLSIZE);
    ctx.lineTo(collision.x * CELLSIZE, collision.y * CELLSIZE + CELLSIZE);
    ctx.stroke();
}


const renderGame = (canvas, state, seconds) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx)
    for (let i = 0; i < state.snake.length; i++) { //if head
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
    if (state.isHealthBox === true) { //collusion not
        drawCell(ctx, state.healthBox, 'purple')
        ctx.font = '20px Arial'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const textX = state.healthBox.x * CELLSIZE + CELLSIZE / 2
        const textY = state.healthBox.y * CELLSIZE + CELLSIZE / 2
        ctx.fillText(`${seconds}`, textX, textY)
    }
    if (!compareCells(state.collision, {x: -1, y: -1})) {
        drawCross(ctx, state.collision)
    }
    drawCross(ctx, state.collision)
}


const d = {
    Up: {dx1: 10, dy1: 15, dx2: 20, dy2: 15},
    Down: {dx1: 7, dy1: 15, dx2: 20, dy2: 15},
    Left: {dx1: 15, dy1: 20, dx2: 15, dy2: 10},
    Right: {dx1: 10, dy1: 10, dx2: 10, dy2: 20}
}

const keyToDirection = {
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
    ArrowLeft: {dx: -1, dy: 0},
    ArrowRight: {dx: 1, dy: 0}
}


const Game = () => {
    const [gameState, setGameState] = useState(() => createInitialState())
    const [seconds, setSeconds] = useState(HEALTHBOXTIME)
    const canvasRef = useRef(null)
    const directionRef = useRef(INITDIRECTION)

    useEffect(() => { //main
        const intervalId = setInterval(() => {
            setGameState((currentGameState) => {
                if (currentGameState.status === "pause" || currentGameState.status === "gameOver") { //todo: if contains
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
        renderGame(canvasRef.current, gameState, seconds)
    }, [gameState, seconds])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space") {
                setGameState((gameState) => {
                    return {...gameState, status: gameState.status === "active" ? "pause" : "active", hasMessage: false}
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

    useEffect(() => {
        if (gameState.lives < 3) {
            const bonusFoodTimer = setTimeout(() => {
                setSeconds(HEALTHBOXTIME)
                setGameState((currentGameState) => {
                    const newFood = getEmptyCell(gameState)
                    return {...currentGameState, isHealthBox: true, healthBox: newFood}
                })
            }, 1000) //delay
            return () => clearTimeout(bonusFoodTimer)
        }
    }, [gameState.lives])

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prevSeconds => {
                if (prevSeconds <= 1) {
                    setGameState((currentGameState) => ({...currentGameState, isHealthBox: false}))
                    return HEALTHBOXTIME
                }
                return prevSeconds - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [gameState.isHealthBox, gameState.status])

    // useEffect(() => {
    //     if (!gameState.isCollision) return
    //     console.log("Oops... You need to change direction and press the space bar")
    //     setGameState(currentGameState => ({...currentGameState, status: "active", hasMessage: true}))
    //     // setGameState(currentGameState => ({...currentGameState, isCollision: false, hasMessage: false}))
    // }, [gameState.isCollision])

    // useEffect(() => {
    //     if (gameState.isCollision && gameState.status === "pause") {
    //         return () => setGameState(currentGameState => ({...currentGameState, hasMessage: true}))
    //     }
    //     return () => setGameState(currentGameState => ({...currentGameState, hasMessage: false}))
    // }, [gameState.isCollision, gameState.status])

    const changeMap = () => {
        if (gameState.walls === WALLSMAP[WALLSMAP.length - 1]) {
            setGameState(currentGameState => ({...currentGameState, walls: WALLSMAP[0], wallsMapNumber: 0}))
        }
        setGameState(currentGameState => ({...currentGameState, walls: WALLSMAP[currentGameState.wallsMapNumber + 1]}))
    }

    return (
        <section>
            <button onClick={() => changeMap()}>Change map</button>
            <h1 className="text-green-600">Snake</h1>
            <h2>Score: {gameState.score}</h2>
            <h2 className={`text-` + gameState.statusColor + `-600`}>Status: {gameState.status}</h2>
            <h3>hasMessage: {gameState.hasMessage ? "true" : "false"}</h3>
            <div>
                <input type="checkbox" id="option1" checked={gameState.strictMode}
                       onChange={() => setGameState(gameState => ({...gameState, strictMode: !gameState.strictMode}))}/>
                <label htmlFor="option1"> Strict boundaries</label>

            </div>
            <div>
                Lives: {"💛".repeat(gameState.lives)}
            </div>
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={COLUMNS * CELLSIZE}
                    height={ROWS * CELLSIZE}/>
            {gameState.hasMessage && <p>Oops... You need to change direction and press the space bar</p>}
        </section>
    )
}

export default Game