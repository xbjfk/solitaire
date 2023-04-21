<script lang="ts">
	let selectedRow: number | null = null;
	let selectedCol: number | null = null;
	let gridElem: HTMLDivElement;

	// TODO: $lib
	import Sudoku from '../lib/sudoku';
	import type { CellState } from '../lib/sudoku';

	const sudoku = new Sudoku(9);
	let state = sudoku.state;

	function updateValidity(idx: number) {
		const cell = state.flat()[idx];
		const num = cell.number;
		const row = Math.floor(idx / 9);
		const col = idx % 9;

		// SQUARE:
		const squareX = Math.floor(row / 3);
		const squareY = Math.floor(col / 3);

		const squareRowIdx = squareX * 3;
		const squareColIdx = squareY * 3;

		const rows = state.slice(squareRowIdx, squareRowIdx + 3);
		const square = rows.map((row) => row.slice(squareColIdx, squareColIdx + 3));

		let invalid = false;

		const validityForEach = (s: CellState) => {
			// Numbers are the same! both are definitely invalid
			if (s === cell) {return}
			if (s.number == num && typeof num === 'number') {
				s.invalid = true;
				invalid = true;
			} else if (s.invalid) {
				// Maybe changing this had made this valid again
				const cellIdx = state.flat().indexOf(s); // TODO: don't do this
				if (cellIdx != -1) {
					const oldInvalid = cell.invalid
					// Dont infinite loop!
					cell.invalid = false
					updateValidity(cellIdx);
					cell.invalid = oldInvalid
				}
			}
		};

		square.flat().forEach(validityForEach);

		// Check row
		state[row].forEach(validityForEach);
		// Check col
		state.map((r) => r[col]).forEach(validityForEach);

		cell.invalid = invalid;
	}

	function sudokustateset(index: number, to: number|number[]) {
		const cell = state.flat()[index];
		if (cell.permanent) {
			return false;
		}
		cell.number = to;

		updateValidity(index);
		state = state;
		return true;
	}

	function updateFocus() {
		if (selectedRow == null || selectedCol == null) {
			return;
		}
		const idx = selectedRow * 9 + selectedCol;
		const child = gridElem.children.item(idx) as HTMLElement;
		child.focus();
	}

	function keyCell(e: KeyboardEvent) {
		if (selectedRow == null || selectedCol == null) {
			return false;
		}
		const idx = selectedRow * 9 + selectedCol;
		const k = e.key;

		if (k == "Delete" || k == "Backspace") {
			return sudokustateset(idx, [])
		}

		const codeReg = /(?!^Digit)[1-9]$/;

		const matches = e.code.match(codeReg);

		const i = matches == null ? -1 : parseInt(matches[0]);
		if (i >= 1 && i <= 9) {
			console.log('SET ' + idx + ' TO ' + i);
			return sudokustateset(idx, i);
		}

		// TODO: make it return false on invalid
		if (k == 'ArrowRight' && selectedCol < 8) {
			selectedCol++;
		} else if (k == 'ArrowLeft' && selectedCol > 0) {
			selectedCol--;
		} else if (k == 'ArrowUp' && selectedRow > 0) {
			selectedRow--;
		} else if (k == 'ArrowDown' && selectedRow < 8) {
			selectedRow++;
		}
		updateFocus();
		return true;
	}
	function clickCell(e: MouseEvent) {
		let elem = e.target as HTMLDivElement;
		selectedRow = Number(elem.dataset.row);
		selectedCol = Number(elem.dataset.col);

		updateFocus();

		return;
	}
</script>

<div id="main">
	<div id="grid" bind:this={gridElem}>
		{#each state.flat() as state, idx}
			{@const row = Math.floor(idx / 9)}
			{@const col = idx % 9}
			{@const selected = selectedRow == row && selectedCol == col}
			{@const selectedScope = selectedRow == row || selectedCol == col}
			<div
				class="cell"
				data-row={row}
				data-col={col}
				class:selected
				class:selectedScope
				class:invalid={state.invalid}
				class:permanent={state.permanent}
				on:click={clickCell}
				on:keyup={keyCell}
				tabindex="0"
			>
				{state.number}
			</div>
		{/each}
	</div>
</div>

<style>
	#grid {
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		aspect-ratio: 1;
		background-color: black;
		gap: 1px;
		padding: 2px;
	}
	.cell {
		background: #ecebfc;
	}
	.cell.selectedScope {
		background-color: #cecce0;
	}
	.cell.selected {
		background-color: #b8b4ed;
	}
	.cell.invalid {
		color: red;
	}
	.cell.permanent {
		color: #444444;
	}
	.cell:nth-child(9n + 3) {
		margin-right: 1px;
	}
	.cell:nth-child(n + 28):nth-child(-n + 36) {
		margin-top: 1px;
	}
	.cell:nth-child(n + 46):nth-child(-n + 54) {
		margin-bottom: 1px;
	}
	.cell:nth-child(9n + 7) {
		margin-left: 1px;
	}
</style>
