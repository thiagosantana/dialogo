import { makeName, isFlowInitialized } from "./app.js";
import { subscribe, publish } from "./event.js";

class Say {
	constructor() {
		this.type = "Say";
		this.name = makeName("SAY_");
		this.nextActivity = "";
		this.sleep = 3000;
		this.utterance = "Lorem Ipsum";
	}
}
function say() {
	return new Say();
}

const configureNewSayBehavior = () => {
	let vinterBtnCreateSay = document.getElementById("vinter-btn-create-say");
	vinterBtnCreateSay.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatesay", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewSayBehavior();
}

init();

export { say };
