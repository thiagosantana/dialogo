import { changeElementDisplay, updateAutomaticSaveStatus } from "./app.js";

function updateFlowTimer() {
	localStorage.setItem("vinter-flow", JSON.stringify(flow));
	updateAutomaticSaveStatus(new Date().toLocaleTimeString());
}

function startTimers() {
	setInterval(updateFlowTimer, 30000);
}

export { startTimers };
