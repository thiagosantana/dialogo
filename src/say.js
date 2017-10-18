import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

let editable = null;

class Say {
	constructor() {
		this.type = "Say";
		this.name = makeName("SAY_");
		this.nextActivity = "";
		this.sleep = "3000";
		this.utterance = "Lorem Ipsum";
		this.utteranceLog = "";
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

const onEditSay = say => {
	editable = say;
	let vinterCloseEditSay = document.getElementById("close-edit-say");
	vinterCloseEditSay.onclick = () => {
		changeElementDisplay("vinter-modal-edit-say", "none");
		editable = null;
	};
	let textUtterance = document.getElementById("edit-say-utterance");
	let textSleep = document.getElementById("edit-say-sleep");
	textUtterance.value = say.utterance;
	textSleep.value = say.sleep;
	changeElementDisplay("vinter-modal-edit-say", "block");
	let btnEditSay = document.getElementById("vinter-btn-confirm-edit-say");
	btnEditSay.onclick = () => {
		say.utterance = textUtterance.value;
		say.sleep = textSleep.value;
		changeElementDisplay("vinter-modal-edit-say", "none");
		editable = null;
		textUtterance.value = "";
		textSleep.value = "";
	};
	let btnDelete = document.getElementById("vinter-btn-confirm-delete-say");
	btnDelete.onclick = () => {
		changeElementDisplay("vinter-modal-edit-say", "none");
		publish("ondeleteactivity", say.id);
	};
};

subscribe("oneditsay", onEditSay);

init();

export { say };
