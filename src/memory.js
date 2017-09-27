import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Memory {
	constructor() {
		this.type = "SetMemory";
		this.name = makeName("MEMORY_");
		this.values = [];
		this.nextActivity = "";
	}
	addValue(value) {
		this.values.push(value);
	}
}

function memory() {
	return new Memory();
}

const configureNewMemoryBehavior = () => {
	let vinterBtnCreateMemory = document.getElementById(
		"vinter-btn-create-memory"
	);
	vinterBtnCreateMemory.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatememory", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewMemoryBehavior();
}

init();

export { memory };
