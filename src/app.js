import { subscribe, publish } from "./event.js";
import { load } from "./graph.js";
import { say } from "./say.js";
import { begin } from "./begin.js";
import { end } from "./end.js";
import { serviceCall } from "./service.js";
import { controlManager } from "./control_manager.js";

let vinter_flow = {};
window.vinter_flow = vinter_flow;

var initialized = false;

const changeElementDisplay = (elementId, newDisplay) => {
	let element = document.getElementById(elementId);
	element.style.display = newDisplay;
};

const configureNewFlowBehavior = () => {
	let vinterBtnNewFlow = document.getElementById("vinter-btn-create-flow");
	vinterBtnNewFlow.onclick = () => {
		if (initialized) {
			alert("Fluxo ja iniciado");
		} else {
			changeElementDisplay("vinter-modal-new-flow", "block");
		}
	};

	let vinterBtnCloseNewFlow = document.getElementById("close-new-flow");
	vinterBtnCloseNewFlow.onclick = () => {
		changeElementDisplay("vinter-modal-new-flow", "none");
	};
	let vinterBtnConfirmCreateFlow = document.getElementById(
		"vinter-btn-confirm-create-flow"
	);
	vinterBtnConfirmCreateFlow.onclick = () => {
		let newFlowName = document.getElementById("new-flow-name");
		let newFlowId = document.getElementById("new-flow-id");
		if (newFlowId.value && newFlowName.value) {
			initNewFlow(newFlowName.value, newFlowId.value);
			addBeginActivity();
			addEndActivity();
			changeElementDisplay("vinter-modal-new-flow", "none");
			publish("onflowcreated", {});
			initialized = true;
		}
	};
};

const configureOpenJSON = () => {
	let vinterBtnShowJson = document.getElementById("vinter-btn-show-json");
	let closeShowJson = document.getElementById("close-show-json");
	closeShowJson.onclick = () => {
		changeElementDisplay("vinter-modal-show-json", "none");
	};
	vinterBtnShowJson.onclick = () => {
		document.getElementById("json-content").innerHTML = JSON.stringify(
			vinter_flow.workflows[0],
			null,
			4
		);
		changeElementDisplay("vinter-modal-show-json", "block");
	};
};

function setupFlow() {
	vinter_flow.workflows = [];
	vinter_flow.workflows[0] = {
		name: "",
		version: 2.0,
		engineVersion: 3.0,
		idAvi: -1,
		activities: []
	};
}

function initNewFlow(newFlowName, newFlowId) {
	vinter_flow.workflows[0].name = newFlowName;
	vinter_flow.workflows[0].idAvi = newFlowId;
}

function addBeginActivity() {
	vinter_flow.workflows[0].activities.push(begin());
}

function addEndActivity() {
	vinter_flow.workflows[0].activities.push(end());
}

function addSayActivity() {
	let theNewSay = say();
	vinter_flow.workflows[0].activities.push(theNewSay);
	publish("onsayadded", theNewSay);
}

function addServiceCallActivity() {
	let theNewServiceCall = serviceCall();
	vinter_flow.workflows[0].activities.push(theNewServiceCall);
	publish("onservicecalladded", theNewServiceCall);
}

function addControlManagerActivity() {
	let theNewControlManager = controlManager(false);
	vinter_flow.workflows[0].activities.push(theNewControlManager);
	publish("oncontrolmanageradded", theNewControlManager);
}

function getBeginActivity() {
	let begin = vinter_flow.workflows[0].activities.filter(
		activity => activity.type === "Root"
	);
	if (begin.length > 0) {
		return begin[0];
	} else {
		return undefined;
	}
}

function getActivityById(id) {
	let activity = vinter_flow.workflows[0].activities.filter(
		activity => activity.id === id
	);
	if (activity.length > 0) {
		return activity[0];
	} else {
		return undefined;
	}
}

function getEndActivity() {
	let end = vinter_flow.workflows[0].activities.filter(
		activity => activity.type === "End"
	);
	if (end.length > 0) {
		return end[0];
	} else {
		return undefined;
	}
}

function makeName(prefix) {
	var text = "";
	var possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 16; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return prefix + text;
}

function isFlowInitialized() {
	return initialized;
}

function init() {
	configureNewFlowBehavior();
	configureOpenJSON();
	setupFlow();
}

subscribe("oncreatesay", () => {
	console.log("oncreatesay");
	addSayActivity();
});

subscribe("oncreateservicecall", () => {
	console.log("oncreateservicecall");
	addServiceCallActivity();
});

subscribe("oncreatecontrolmanager", () => {
	console.log("oncreatecontrolmanager");
	addControlManagerActivity();
});

init();

export {
	getBeginActivity,
	getEndActivity,
	getActivityById,
	makeName,
	isFlowInitialized
};
