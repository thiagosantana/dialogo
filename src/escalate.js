import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Escalate {
	constructor() {
		this.name = makeName("ESCALATE_");
		this.type = "Escalate";
		this.utterance = "Going to the human!";
		this.sleep = "3000";
		this.nextActivity = "";
	}
}

function escalate() {
	return new Escalate();
}

const configureNewEscalateBehavior = () => {
	let vinterBtnCreateEscalate = document.getElementById(
		"vinter-btn-create-escalate"
	);
	vinterBtnCreateEscalate.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreateescalate", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewEscalateBehavior();
}

init();

export { escalate };
