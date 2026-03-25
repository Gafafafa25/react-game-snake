import {useEffect, useState} from "react";


const Game = () => {
    const [size, setSize] = useState(20)
    const [direction, setDirection] = useState({dx: 1, dy: 0})
    const [snake] = useState([
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 }
    ])


    function drawCube(x, y) {  // отрисовать элемент змейки (квадратик)
        ctx.fillRect(x * size, y * size, size, size)
    }

    function drawSnake() {  // отрисовать всю змейку
        for (let part of snake) {
            drawCube(part.x, part.y)
        }
    }

    function move() {  // сдвиг змейки на dx/dy
        // решение только тут
        if (direction.dx === 1 && direction.dy === 0) {
            snake.pop()
            snake.unshift({x: snake[0].x + 1, y: snake[0].y})
        }
        if (direction.dx === -1 && direction.dy === 0) {
            snake.pop()
            snake.unshift({x: snake[0].x - 1, y: snake[0].y})
        }
        if (direction.dx === 0 && direction.dy === 1) {
            snake.pop()
            snake.unshift({x: snake[0].x, y: snake[0].y + 1})
        }
        if (direction.dx === 0 && direction.dy === -1) {
            snake.pop()
            snake.unshift({x: snake[0].x, y: snake[0].y - 1})
        }
    }


    const game = () => {
        console.log("playing game...")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        move()  // сдвиг змейки
        drawSnake() // отрисовка змейки
    }

    useEffect(() => {
        const interval = setInterval(game, 200)
        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if(e.key==="ArrowUp"){direction.dx=0;direction.dy=-1}
            if(e.key==="ArrowDown"){direction.dx=0;direction.dy=1}
            if(e.key==="ArrowLeft"){direction.dx=-1;direction.dy=0}
            if(e.key==="ArrowRight"){direction.dx=1;direction.dy=0}
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [direction])

    return (
        <>
            <h1 className="text-red-200">Snake</h1>
            <canvas id="game" width="400" height="400"></canvas>
        </>
    )
}

export default Game