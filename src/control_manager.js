import { makeName, isFlowInitialized } from "./app.js";
import { subscribe, publish } from "./event.js";

class ControlManager {
	constructor(canEnable) {
		this.name = makeName("ControlManager_");
		this.type = "ClientControlManagement";
		this.nextActivity = "";
		this.actions = [];
	}

	addAction(action) {
		this.actions.push({
			type: "InputMessageBox",
			properties: {
				disableControls: action
			}
		});
	}
}

const configureNewControlManagerBehavior = () => {
	let vinterBtnCreateControlManager = document.getElementById(
		"vinter-btn-create-control-manager"
	);
	vinterBtnCreateControlManager.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatecontrolmanager", {});
		} else {
			alert("Fluxo ainda não ativo.");
		}
	};
};

function controlManager(canEnable) {
	let controlManager = new ControlManager();
	controlManager.addAction(canEnable);
	return controlManager;
}

export { controlManager };
