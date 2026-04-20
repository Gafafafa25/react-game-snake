import {useEffect, useState, useRef} from "react";


const Game = () => {
    const [size, setSize] = useState(20)
    const [direction, setDirection] = useState({dx: 1, dy: 0})
    const [snake, setSnake] = useState([
        {x: 5, y: 5},
        {x: 6, y: 5},
        {x: 7, y: 5}
    ])
    const canvasRef = useRef(null)
    // const fruitImgRef = useRef(null)
    const [score, setScore] = useState(0)
    const newCoords = () => {
        let randomX = Math.floor(Math.random() * 13) + 2
        let randomY = Math.floor(Math.random() * 13) + 2

        //todo:
        //add do while
        for (const {row, col} of snake) {
            if (randomX === row && randomY === col) {
                return newCoords()
            }
        }
        return {x: randomX, y: randomY}

        // if (randomX !== snake[0].x && randomY !== snake[0].y &&
        //     randomX !== snake[1].x && randomY !== snake[1].y &&
        //     randomX !== snake[2].x && randomY !== snake[2].y) {
        //     return {x: randomX, y: randomY}
        // }
        // return newCoords()
    }
    const [food, setFood] = useState(() => newCoords())
    const [strictMode, setStrictMode] = useState(false)
    // console.log(food)
    // console.log(snake)
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
        console.log(score, "score here")
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
        console.log(food.x, food.y)
    }

    // setFood(drawFruit())

    function move() {  // сдвиг змейки на dx/dy
        // решение только тут
        const newSnake = [...snake]
        // console.log(newSnake, "new")
        if (direction.dx === 1 && direction.dy === 0) {
            newSnake.pop()
            //todo if
            newSnake.unshift({x: newSnake[0].x + 1, y: newSnake[0].y})
        }
        if (direction.dx === -1 && direction.dy === 0) {
            newSnake.pop()
            newSnake.unshift({x: newSnake[0].x - 1, y: newSnake[0].y})
        }
        if (direction.dx === 0 && direction.dy === 1) {
            newSnake.pop()
            newSnake.unshift({x: newSnake[0].x, y: newSnake[0].y + 1})
        }
        if (direction.dx === 0 && direction.dy === -1) {
            newSnake.pop()
            newSnake.unshift({x: newSnake[0].x, y: newSnake[0].y - 1})
        }
        setSnake(newSnake)
    }


    const game = () => {
        // console.log("playing game...")
        console.log(snake.length, " length")
        move()  // сдвиг змейки
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // console.log("**")
            setFood(() => newCoords())
            setScore(score + 1)
        }
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawGrid() // отрисовка сетки
        drawSnake() // отрисовка змейки
        drawFruit() // отрисовка фрукта
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
                //todo if
                setDirection({dx: 0, dy: -1})
            }
            if (e.key === "ArrowDown") {
                setDirection({dx: 0, dy: 1})
            }
            if (e.key === "ArrowLeft") {
                if (direction.dx !== 1 && direction.dy !== 0) {
                    setDirection({dx: -1, dy: 0})
                }
            }
            if (e.key === "ArrowRight") {
                setDirection({dx: 1, dy: 0})
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