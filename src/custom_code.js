import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class CustomCode {
	constructor() {
		this.name = makeName("CUSTOMCODE_");
		this.type = "CustomCode";
		this.nextActivity = "";
		this.script = "";
	}
}

function custom() {
	return new CustomCode();
}

const configureNewCustomCodeBehavior = () => {
	let vinterBtnCreateCustomCode = document.getElementById(
		"vinter-btn-create-custom-code"
	);
	vinterBtnCreateCustomCode.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatecustomcode", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewCustomCodeBehavior();
}

init();

export { custom };
