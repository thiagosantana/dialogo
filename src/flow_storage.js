import { subscribe, publish } from "./event.js";

function loadExistingFlow() {
	let vinter_flow = localStorage.getItem("vinter-flow");
	if (vinter_flow) {
		console.log("TEM FLUXO");
	} else {
		console.log("NAO TEM FLUXO");
	}
}

subscribe("onflowcreated", () => {
	localStorage.setItem("vinter-flow", JSON.stringify(flow));
});

export { loadExistingFlow };
