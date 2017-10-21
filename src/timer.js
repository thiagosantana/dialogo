import { changeElementDisplay, updateAutomaticSaveStatus } from "./app.js";
import { updateExistingFlow } from "./flow_storage.js";

function updateFlowTimer() {
	updateExistingFlow();
	updateAutomaticSaveStatus(new Date().toLocaleTimeString());
}

function startTimers() {
	setInterval(updateFlowTimer, 30000);
}

export { startTimers };
