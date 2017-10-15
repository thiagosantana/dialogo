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

function showEscalateModal() {
	changeElementDisplay("vinter-modal-edit-escalate", "block");
}

function configureCloseBtn() {
	let btnClose = document.getElementById("close-edit-escalate");
	btnClose.onclick = () => {
		changeElementDisplay("vinter-modal-edit-escalate", "none");
	};
}

function configureBtnEditEscalate(escalate) {
	let btnEdit = document.getElementById("vinter-btn-confirm-edit-escalate");
	let txtUtt = document.getElementById("edit-escalate-utterance");
	txtUtt.value = escalate.utterance;
	let txtSleep = document.getElementById("edit-escalate-sleep");
	//selectType.value = disconnect.type;
	btnEdit.onclick = () => {
		escalate.utterance = txtUtt.value;
		escalate.sleep = txtSleep.value;
		changeElementDisplay("vinter-modal-edit-escalate", "none");
	};
}

function configureBtnDeleteEscalate(escalate) {
	let btnDelete = document.getElementById(
		"vinter-btn-confirm-delete-escalate"
	);
	btnDelete.onclick = () => {
		changeElementDisplay("vinter-modal-edit-escalate", "none");
		publish("ondeleteactivity", escalate.id);
	};
}

const onEditEscalate = escalate => {
	showEscalateModal();
	configureCloseBtn();
	configureBtnEditEscalate(escalate);
	configureBtnDeleteEscalate(escalate);
};

subscribe("oneditescalate", onEditEscalate);

export { escalate };
