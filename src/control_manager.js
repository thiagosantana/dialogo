import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class ControlManager {
	constructor() {
		this.name = makeName("ControlManager_");
		this.type = "ClientControlManagement";
		this.nextActivity = "";
		this.actions = [];
		this.x = "";
		this.y = "";
		this.id = "";
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
		console.log("control manager");
		if (isFlowInitialized()) {
			publish("oncreatecontrolmanager", {});
		} else {
			alert("Fluxo ainda não ativo.");
		}
	};
};

function controlManager(canEnable) {
	let controlManager = new ControlManager();
	//controlManager.addAction(canEnable);
	return controlManager;
}

function init() {
	configureNewControlManagerBehavior();
}

function openModal() {
	changeElementDisplay("vinter-modal-edit-control", "block");
}

function configCloseBtn() {
	let closeBtn = document.getElementById("close-edit-control");
	closeBtn.onclick = () => {
		changeElementDisplay("vinter-modal-edit-control", "none");
	};
}

function configEditBtn(control) {
	let editBtn = document.getElementById("vinter-btn-confirm-edit-control");
	editBtn.onclick = () => {
		let select = document.getElementById("control-property");
		if (select.value && control.actions.length === 0) control.addAction(select.value);
		changeElementDisplay("vinter-modal-edit-control", "none");
	};
}

function configDeleteBtn(control) {
	let deleteBtn = document.getElementById(
		"vinter-btn-confirm-delete-control"
	);
	deleteBtn.onclick = () => {
		changeElementDisplay("vinter-modal-edit-control", "none");
		publish("ondeleteactivity", control.id);
	};
}

const onEditControl = control => {
	openModal();
	configCloseBtn();
	configEditBtn(control);
	configDeleteBtn(control);
};

subscribe("oneditcontrolmgmt", onEditControl);

export { controlManager };
init();
