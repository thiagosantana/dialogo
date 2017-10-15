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

function showDisconnectModal() {
	changeElementDisplay("vinter-modal-edit-disconnect", "block");
}

function configureCloseBtn() {
	let btnClose = document.getElementById("close-edit-disconnect");
	btnClose.onclick = () => {
		changeElementDisplay("vinter-modal-edit-disconnect", "none");
	};
}

function configureBtnEditService(disconnect) {
	let btnEdit = document.getElementById("vinter-btn-confirm-edit-disconnect");
	let txtUtt = document.getElementById("disconnect-utterance");
	txtUtt.value = disconnect.utterance;
	let selectType = document.getElementById("disconnect-type");
	//selectType.value = disconnect.type;
	btnEdit.onclick = () => {
		disconnect.utterance = txtUtt.value;
		disconnect.disconnectType = selectType.value;
		changeElementDisplay("vinter-modal-edit-disconnect", "none");
	};
}

const onEditDisconnect = disconnect => {
	console.log("...");
	showDisconnectModal();
	configureCloseBtn();
	configureBtnEditService(disconnect);
};
subscribe("oneditdisconnect", onEditDisconnect);

export { disconnect };
