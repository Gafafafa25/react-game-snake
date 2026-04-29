import {useEffect, useState, useRef} from "react";

const Game = () => {
    const [size, setSize] = useState(20)
    const [direction, setDirection] = useState({dx: 1, dy: 0})
    const [snake, setSnake] = useState([
        {x: 5, y: 5},
        {x: 6, y: 5},
        {x: 7, y: 5}
    ])
    const [score, setScore] = useState(0)
    // const [food, setFood] = useState(() => getFreePoint())
    const [food, setFood] = useState({x: 10, y: 10}) //todo: random point
    const [wall, setWall] = useState({x: -1, y: -1}) //todo:
    const [strictMode, setStrictMode] = useState(false)
    const canvasRef = useRef(null)
    // const fruitImgRef = useRef(null)

    const getFreePoint = () => {
        let randomX, randomY
        let isTouchedTail = 0
        do {
            randomX = Math.floor(Math.random() * 13) + 2
            randomY = Math.floor(Math.random() * 13) + 2

            // для проверки попадания в хвост
            // randomX = snake[Math.floor(snake.length / 2)].x
            // randomY = snake[Math.floor(snake.length / 2)].y
            for (const {x, y} of snake) {
                if (randomX === x && randomY === y) {
                    isTouchedTail = 1
                }
            }
        } while (isTouchedTail === 1 || randomX === food.x && randomY === food.y)
        return {x: randomX, y: randomY}
    }

    useEffect(() => {
        setFood(() => getFreePoint())
        const newWalls = []
        const wall = () => getFreePoint()
        for (let i = 0; i < 4; i++) {
            newWalls.push({x: wall.x + i, y: wall.y + i})
        }
        setWall(newWalls)
    }, [])


    // useEffect(() => {
    //     const fruitImg = new Image()
    //     fruitImg.src = '../assets/fruit.png'
    //     fruitImg.onload = () => {
    //         fruitImgRef.current = fruitImg
    //     }
    // }, [])

    useEffect(() => {
        const newSnake = [...snake]
        const changedX = newSnake[newSnake.length - 1].x + 1
        const changedY = newSnake[newSnake.length - 1].y + 1
        newSnake.push({x: changedX, y: changedY})
        setSnake(newSnake)
        // console.log(score, "score here")
    }, [score])

    const changeMode = () => {
        setStrictMode(!strictMode)
    }

    useEffect(() => {
        if (strictMode) {
            const canvas = canvasRef.current
            const width = canvas.width / size
            const height = canvas.height / size
            // console.log(width, height, " here wh")
            if (snake[0].x >= width || snake[0].y >= height || snake[0].x < 0 || snake[0].y < 0) {
                alert("Defeat")
                return
            }
        }
    }, [strictMode, snake])

    useEffect(() => {
        for (let i = 0; i < 4; i++) {
            if (snake[0].x === wall.x + i && snake[0].y === wall.y + i) {
                alert("Defeat")
                return
            }
        }
    }, [snake])

    // useEffect(() => {
    //     if (snake[0].x === food.x && snake[0].y === food.y) {
    //         // console.log("**")
    //         setFood(() => newCoords())
    //         setScore(score + 1)
    //     }
    // }, [snake])

    function drawGrid() {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        for (let x = 0; x <= width; x += size) {
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
        }

        for (let y = 0; y <= height; y += size) {
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
        }

        ctx.strokeStyle = '#ccc'
        ctx.lineWidth = 1
        ctx.stroke()
    }


    function drawCube(x, y) {  // отрисовать элемент змейки (квадратик)
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'black'
        ctx.fillRect(x * size, y * size, size, size)
    }

    function drawSnake() {  // отрисовать всю змейку
        for (let part of snake) {
            drawCube(part.x, part.y)
        }
    }

    function drawFruit() {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'red'
        ctx.fillRect(food.x * size, food.y * size, size, size)
        // console.log(food.x, food.y)
    }


    function drawWall(x, y) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'blue'
        // for (let i = 0; i < 4; i++) {
            ctx.fillRect((x) * size, (y) * size, size, size)
        // }
    }

    function move() {  // сдвиг змейки на dx/dy
        // решение только тут
        const newSnake = [...snake]
        // console.log(newSnake, "new")
        const canvas = canvasRef.current
        const width = canvas.width / size
        const height = canvas.height / size

        if (direction.dx === 1 && direction.dy === 0) {
            newSnake.pop()
            if (strictMode === false &&
                (snake[0].x >= width || snake[0].y >= height || snake[0].x < 0 || snake[0].y < 0)
            ) {
                newSnake.unshift({x: 0, y: newSnake[0].y})
            } else {
                newSnake.unshift({x: newSnake[0].x + 1, y: newSnake[0].y})
            }
        }
        if (direction.dx === -1 && direction.dy === 0) {
            newSnake.pop()
            if (strictMode === false &&
                (snake[0].x >= width || snake[0].y >= height || snake[0].x < 0 || snake[0].y < 0)
            ) {
                newSnake.unshift({x: width - 1, y: newSnake[0].y})
            } else {
                newSnake.unshift({x: newSnake[0].x - 1, y: newSnake[0].y})
            }
        }
        if (direction.dx === 0 && direction.dy === 1) {
            newSnake.pop()
            if (strictMode === false &&
                (snake[0].x >= width || snake[0].y >= height || snake[0].x < 0 || snake[0].y < 0)
            ) {
                newSnake.unshift({x: newSnake[0].x, y: 0})
            } else {
                newSnake.unshift({x: newSnake[0].x, y: newSnake[0].y + 1})
            }
        }
        if (direction.dx === 0 && direction.dy === -1) {
            newSnake.pop()
            if (strictMode === false &&
                (snake[0].x >= width || snake[0].y >= height || snake[0].x < 0 || snake[0].y < 0)
            ) {
                newSnake.unshift({x: newSnake[0].x, y: height - 1})
            } else {
                newSnake.unshift({x: newSnake[0].x, y: newSnake[0].y - 1})
            }
        }
        setSnake(newSnake)
    }


    const game = () => {
        // console.log("playing game...")
        // console.log(snake.length, " length")
        move()  // сдвиг змейки
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // console.log("**")
            setFood(() => getFreePoint())
            setScore(score + 1)
        }
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawGrid() // отрисовка сетки
        drawSnake() // отрисовка змейки
        drawFruit() // отрисовка фрукта
        drawWall() // отрисовка стены
    }

    useEffect(() => {
        const interval = setInterval(game, 200)
        return () => {
            clearInterval(interval)
        }
    }, [snake, direction])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp") {
                if (direction.dx !== 0 && direction.dy !== 1) {
                    setDirection({dx: 0, dy: -1})
                }
            }
            if (e.key === "ArrowDown") {
                if (direction.dx !== 0 && direction.dy !== -1) {
                    setDirection({dx: 0, dy: 1})
                }
            }
            if (e.key === "ArrowLeft") {
                if (direction.dx !== 1 && direction.dy !== 0) {
                    setDirection({dx: -1, dy: 0})
                }
            }
            if (e.key === "ArrowRight") {
                if (direction.dx !== -1 && direction.dy !== 0) {
                    setDirection({dx: 1, dy: 0})
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [direction])



    return (
        <>
            <h1 className="text-green-600">Snake</h1>
            <h2>Score: {score}</h2>
            <div>
                <input type="checkbox" id="option1" checked={strictMode} onChange={changeMode}/>
                <label htmlFor="option1"> Strict boundaries</label>
            </div>
            <canvas className="border-2 border-gray-800 rounded lg" ref={canvasRef} width={400} height={300}/>
        </>
    )
}

export default Game