const MAX_UNDO_REDO = 10;
let currentUndo = 0;
function undo() {
	if (currentUndo < MAX_UNDO_REDO) {
		console.log("UNDO");
		currentUndo++;
	} else {
		alert("Max Undo Limit");
	}
}
function redo() {
	if (currentUndo >= 0) {
		console.log("REDO");
		currentUndo--;
	}
}

export { undo, redo };
