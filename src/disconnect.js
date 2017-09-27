import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Disconnect {
	constructor() {
		this.name = makeName("DISCONNECT_");
		this.type = "Disconnect";
		this.disconnectType = "3";
		this.utterance = "Tchau";
		this.nextActivity = "";
	}
}

function disconnect() {
	return new Disconnect();
}

const configureNewDisconnectBehavior = () => {
	let vinterBtnCreateDisconnect = document.getElementById(
		"vinter-btn-create-disconnect"
	);
	vinterBtnCreateDisconnect.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatedisconnect", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewDisconnectBehavior();
}

init();

export { disconnect };
