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

subscribe("onflowcreated", () => {
	localStorage.setItem("vinter-flow", JSON.stringify(flow));
});

export { loadExistingFlow };
