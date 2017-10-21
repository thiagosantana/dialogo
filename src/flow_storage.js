import { changeElementDisplay, load } from "./app.js";
import { subscribe, publish } from "./event.js";

function loadExistingFlow() {
	let vinter_flow = localStorage.getItem("vinter-flow");
	console.log("try to load flow");
	if (vinter_flow) {
		console.log("loading...");
		publish("loadfromstorage", vinter_flow);
	}
}

function deleteExistingFlow() {
	localStorage.removeItem("vinter-flow");
}

function updateExistingFlow() {
	localStorage.setItem("vinter-flow", JSON.stringify(flow));
}

subscribe("onflowcreated", () => {
	localStorage.setItem("vinter-flow", JSON.stringify(flow));
});

export { loadExistingFlow, deleteExistingFlow, updateExistingFlow };
