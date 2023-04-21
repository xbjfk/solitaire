const size = 9
const numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9]


function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export type CellState = {
	permanent: boolean;
	invalid: boolean;
	number: number | number[];
}

export default class Sudoku {
	grid: (number|null)[][]
	solution: (number|null)[][] = []
	state: CellState[][] = []
	constructor(size: number) {
		this.grid = Array.from(Array(size), _ => Array(size).fill(null))
		this.#makeGrid()
	}


	#makeGrid() {
		this.#solveGrid(true)
		this.grid.forEach(row => {
			console.log(row.join())
		})
		console.log("--------")
		let attempts = 5

		this.solution = structuredClone(this.grid)
		while (attempts > 0) {

			let rowIdx, colIdx: number
			let value: number|null
			do {
				rowIdx = getRandomInt(9)
				colIdx = getRandomInt(9)
				value = this.grid[rowIdx][colIdx]
			} while (value == null) // Pick random non empty cell

			this.grid[rowIdx][colIdx] = null


			let oldgrid = this.grid
			let copy = structuredClone(this.grid)
			this.grid = copy

			this.counter = 0

			this.#solveGrid(false)

			this.grid = oldgrid

			// This solution has more than 1
			if (this.counter != 1) {
				this.grid[rowIdx][colIdx] = value
				attempts -= 1
			}
		}
		this.grid.forEach(row => {
			console.log(row.join())
		})
		this.state = this.grid.map(row => {
			return row.map(e => {
				return e == null ? {number: [], permanent: false, invalid: false} : {number: e, permanent: true, invalid: false}
			})
		})
	}

	#isFinished() {
		return !this.grid.flat().includes(null)
	}

	counter = 0
	#solveGrid(initial = false) {
		const zeroIndex = this.grid.flat().indexOf(null)
		const rowIdx = Math.trunc(zeroIndex / 9)
		const colIdx = zeroIndex % 9
		const item = this.grid[rowIdx][colIdx]

		if (item == null) {
			let numbers: number[];
			if (initial) {
				const numberCopy = [...numberList]
				numberCopy.sort(() => 0.5 - Math.random())
				numbers = numberCopy
			} else {
				numbers = numberList
			}
			for (const number of numbers) {
				if (this.#isValid(rowIdx, colIdx, number)) {

					this.grid[rowIdx][colIdx] = number
					if (this.#isFinished()) {
						if (!initial) {
							this.counter++;
							break;
						} else {
							return true;
						}
					}
					if (this.#solveGrid(initial)) {
						return true;
					}
				}
			}
			this.grid[rowIdx][colIdx] = null
		}
	}

	#colContains(colIdx: number, value: number) {
		return this.grid.some(row => row[colIdx] == value)
	}

	#rowContains(rowIdx: number, value: number) {
		return this.grid[rowIdx].includes(value)
	}

	#squareContains(rowIdx: number, colIdx: number, value: number) {
		const squareX = Math.floor(rowIdx / 3)
		const squareY = Math.floor(colIdx / 3)

		const squareRowIdx = squareX * 3;
		const squareColIdx = squareY * 3;

		const rows = this.grid.slice(squareRowIdx, squareRowIdx + 3)
		const square = rows.map(row => row.slice(squareColIdx, squareColIdx + 3))
		return square.some(row => row.includes(value))
	}

	#isValid(rowIdx: number, colIdx: number, value: number) {
		return !(this.#colContains(colIdx, value) || this.#rowContains(rowIdx, value) || this.#squareContains(rowIdx, colIdx, value))
	}
}
