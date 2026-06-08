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
const compareDirections = (direction1, direction2) => {
    return direction1.dx === direction2.dx && direction1.dy === direction2.dy
}
const isOutside = (head) => {
    return head.x < 0 || head.y < 0 || head.x >= COLUMNS || head.y >= ROWS
}
const createInitialState = () => {
    const WALLS = [{x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}]
    const FOOD = {x: 4, y: 4}
    const FOODX2 = {x: 8, y: 8}
    const FOODX2COUNT = 0
    const COLLISION = 0
    const LIVESCOUNTER = 3
    const BONUSFOOD = 0
    const BONUSFOODTIMER = false
    const TIMERTIME = 7
    const COUNTDOWN = 7

    return {
        snake: INITSNAKE,
        walls: WALLS,
        food: FOOD,
        foodX2: FOODX2,
        foodX2Count: FOODX2COUNT,
        bonusFood: BONUSFOOD,
        bonusFoodTimer: BONUSFOODTIMER, // todo: rename
        timerTime: TIMERTIME, //todo: rename startTimer
        countdown: COUNTDOWN,
        collision: COLLISION,
        isCollision: false,
        direction: INITDIRECTION,
        livesCounter: LIVESCOUNTER, //todo: rename lives
        score: 0,
        strictMode: false,
        status: "active",
        statusColor: "green"
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
    // console.log(currentState.bonusFood, " currentState.bonusFood")
    if (isOutside(tmpHead) && currentState.strictMode === true) {
        // alert("gameOver")
        //isCollision
        // return {...currentState, status: "gameOver", statusColor: "red", livesCounter: currentState.livesCounter - 1}
        return {...currentState, isCollision: true, livesCounter: currentState.livesCounter - 1}
    }
   for (let i = 1; i < currentState.snake.length; i++) {
       if (compareCells(tmpHead, currentState.snake[i])) {
           // drawCross() // add status -1
           return {...currentState, collision: currentState.snake[i]}
       }
   }
    for (let i = 0; i < currentState.walls.length; i++) {
        if (compareCells(tmpHead, currentState.walls[i])) {
            // alert("gameOver")
            //status not here?
            return {...currentState, status: "gameOver", statusColor: "red"} //add direction: direction ?
        }
    }
    const snake = [tmpHead, ...currentState.snake.slice(0, -1)]
    //fruit collision
    //todo: all collisions in one function
    if (compareCells(tmpHead, currentState.bonusFood)) {
        // console.log(" + +++")
        const bonusFood = getEmptyCell(currentState)
        //status changes ??
        return {...currentState, snake: snake, score: currentState.score,
            direction: direction, bonusFood: bonusFood, livesCounter: currentState.livesCounter + 1, bonusFoodTimer: false}
    }
    if (compareCells(tmpHead, currentState.food) || currentState.foodX2Count > 0 || compareCells(tmpHead, currentState.bonusFood)) {
        const food = getEmptyCell(currentState)
        const score = currentState.score + 1
        const snake = [tmpHead, ...currentState.snake]
        return {...currentState, snake: snake, food: food, score: score, foodX2Count: currentState.foodX2Count - 1, direction: direction}
    }
    if (compareCells(tmpHead, currentState.foodX2)) {
        const foodX2 = getEmptyCell(currentState)
        const score = currentState.score * 2
        const snake = [tmpHead, ...currentState.snake]
        return {...currentState, snake: snake, foodX2: foodX2, score: score, foodX2Count: 5, direction: direction}
    }

    return {...currentState, snake: snake, direction: direction}
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
    ctx.fillStyle = 'black'
    ctx.fillRect(head.x * CELLSIZE, head.y * CELLSIZE, CELLSIZE, CELLSIZE)

    let directionKey = ""
    if (compareDirections(direction, {dx: 1, dy: 0})) {
        directionKey = "Right"
    } else if (compareDirections(direction, {dx: -1, dy: 0})) {
        directionKey = "Left"
    } else if (compareDirections(direction, {dx: 0, dy: -1})) {
        directionKey = "Up"
    }
    else if (compareDirections(direction, {dx: 0, dy: 1})) {
        directionKey = "Down"
    }
    const params = d[directionKey]

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
const drawCross = (ctx, collision) => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Линия от верхнего левого к нижнему правому
    ctx.moveTo(collision.x - CELLSIZE / 2, collision.y - CELLSIZE / 2);
    ctx.lineTo(collision.x + CELLSIZE / 2, collision.y + CELLSIZE / 2);
    // Линия от нижнего левого к верхнему правому
    ctx.moveTo(collision.x - CELLSIZE / 2, collision.y + CELLSIZE / 2);
    ctx.lineTo(collision.x + CELLSIZE / 2, collision.y - CELLSIZE / 2);
    ctx.stroke();
}

//todo: add function timer

// const countdown = () => {
//     set
// }

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
    if (state.bonusFoodTimer === true) { //collusion not
        drawCell(ctx, state.bonusFood, 'purple')
        //todo: add timerTime
        ctx.font = '20px Arial'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const textX = state.bonusFood.x * CELLSIZE + CELLSIZE / 2
        const textY = state.bonusFood.y * CELLSIZE + CELLSIZE / 2
        ctx.fillText(`${seconds}`, textX, textY)
    }

    // console.log(state.bonusFoodTimer, " bonusFoodTimer")
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
    // const [lives, setLives] = useState(3)
    const [seconds, setSeconds] = useState(7) //todo: rename
    // const MAXLIVES = 5
    // const MINLIVES = 1
    const canvasRef = useRef(null)
    const directionRef = useRef(INITDIRECTION)
    // const addHeart = () => {
    //     setLives(prev => Math.min(prev + 1, lives))
    // }
    // const removeHeart = () => {
    //     setLives(prev => Math.max(prev - 1, 0))
    // }

    useEffect(() => { //main
        const intervalId = setInterval(() => {
            setGameState((currentGameState) => {
                if (currentGameState.status === "pause" || currentGameState.status === "gameOver") { //todo: if contains
                    return currentGameState
                }
                // console.log("getNextGameState", new Date().getTime())
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
    }, [gameState])

    useEffect(() => {
        const handleKeyDown = (e) => {
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

    useEffect(() => {
        const bonusFoodTimer = setTimeout(() => {
            // console.log(gameState.bonusFood, " bonusFoodTimerEffect")
            const newFood = getEmptyCell(gameState)
            setGameState((currentGameState) => {
                return {...currentGameState, bonusFoodTimer: true, bonusFood: newFood}
            })
        }, 1000) //delay
        return () => clearTimeout(bonusFoodTimer)
    }, [gameState.livesCounter]) //add bonusfood collision //+1 live

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds - 1 < 0 ? 0: prevSeconds - 1)
        }, 1000) //countdown
        return () => {
            clearInterval(interval)
            setSeconds(7)
        }
    }, [])

    useEffect(() => {
        if (seconds !== 0) return //todo: if no timer square
        setGameState(currentGameState => ({...currentGameState, bonusFoodTimer: false}))
    }, [seconds])

    useEffect(() => {
        const delay3Seconds = setTimeout(() => {
            setGameState(currentGameState => ({...currentGameState, status: "pause"}))
        }, 3000)
        return () => {
            clearTimeout(delay3Seconds)
            setGameState(currentGameState => ({...currentGameState, status: "active", isCollision: false}))
        }
    }, [gameState.isCollision])

    // useEffect(() => {
    //     setLives((lives) => removeHeart())
    // }, [gameState.collision])

    return (
        <section>
            <h1 className="text-green-600">Snake</h1>
            <h2>Score: {gameState.score}</h2>
            <h2 className={`text-` + gameState.statusColor + `-600`}>Status: {gameState.status}</h2>
            <div>
                <input type="checkbox" id="option1" checked={gameState.strictMode}
                       onChange={() => setGameState(gameState => ({...gameState, strictMode: !gameState.strictMode}))}/>
                <label htmlFor="option1"> Strict boundaries</label>

            </div>
            <div>
                Lives: {"💛".repeat(gameState.livesCounter)}
            </div>
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={COLUMNS * CELLSIZE}
                    height={ROWS * CELLSIZE}/>
        </section>
    )
}

export default Game