import { subscribe, publish } from "./event.js";
import { load } from "./graph.js";
import { say } from "./say.js";
import { begin } from "./begin.js";
import { end } from "./end.js";
import { decision } from "./decision.js";
import { serviceCall } from "./service.js";
import { question } from "./question.js";
import { memory } from "./memory.js";
import { custom } from "./custom_code.js";
import { disconnect } from "./disconnect.js";
import { escalate } from "./escalate.js";
import { controlManager } from "./control_manager.js";
import { form } from "./form.js";
import { openMenu } from "./menu.js";
import { undo, redo } from "./undo_redo.js";

let vinter_flow = {};
window.flow = vinter_flow;
window.mustache = require("mustache");

hljs.initHighlightingOnLoad();

var initialized = false;

const changeElementDisplay = (elementId, newDisplay) => {
	let element = document.getElementById(elementId);
	element.style.display = newDisplay;
};

const configureLoadBehavior = () => {
	console.log("..");
	let btnLoadFlow = document.getElementById("vinter-btn-load-flow");
	let btnCloseLoad = document.getElementById("close-load");
	let btnLoad = document.getElementById("vinter-btn-load-json");
	let txtLoadJson = document.getElementById("the-json");
	btnLoadFlow.onclick = () => {
		changeElementDisplay("vinter-load-json", "block");
	};
	btnCloseLoad.onclick = () => {
		changeElementDisplay("vinter-load-json", "none");
	};
	btnLoad.onclick = () => {
		load(txtLoadJson.value);
		initialized = true;
	};
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
			vinter_flow,
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
		version: "2.0",
		engineVersion: "3.0",
		idAvi: -1,
		activities: []
	};
}

function initNewFlow(newFlowName, newFlowId) {
	vinter_flow.workflows[0].name = newFlowName;
	vinter_flow.workflows[0].idAvi = newFlowId;
}

function addBeginActivity(activity) {
	if (activity) {
		vinter_flow.workflows[0].activities.push(activity);
	} else {
		vinter_flow.workflows[0].activities.push(begin());
	}
}

function addEndActivity(activity) {
	if (activity) {
		vinter_flow.workflows[0].activities.push(activity);
	} else {
		vinter_flow.workflows[0].activities.push(end());
	}
}

function addSayActivity(activity) {
	if (activity) {
		vinter_flow.workflows[0].activities.push(activity);
		publish("onsayadded", activity);
	} else {
		let theNewSay = say();
		vinter_flow.workflows[0].activities.push(theNewSay);
		publish("onsayadded", theNewSay);
	}
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

function addFormActivity(activity) {
	if (activity) {
		vinter_flow.workflows[0].activities.push(activity);
		publish("onformadded", activity);
	} else {
		let theForm = form();
		vinter_flow.workflows[0].activities.push(theForm);
		publish("onformadded", theForm);
	}
}

function addDecisionActivity() {
	let theDecision = decision();
	vinter_flow.workflows[0].activities.push(theDecision);
	publish("ondecisionadded", theDecision);
}

function addQuestionActivity() {
	let theQuestion = question();
	vinter_flow.workflows[0].activities.push(theQuestion);
	publish("onquestionadded", theQuestion);
}

function addMemoryActivity() {
	let theMemory = memory();
	vinter_flow.workflows[0].activities.push(theMemory);
	publish("onmemoryadded", theMemory);
}

function addCustomCodeActivity() {
	let theCustom = custom();
	vinter_flow.workflows[0].activities.push(theCustom);
	publish("oncustomcodeadded", theCustom);
}

function addDisconnectActivity() {
	let theDisconnect = disconnect();
	vinter_flow.workflows[0].activities.push(theDisconnect);
	publish("ondisconnectadded", theDisconnect);
}

function addEscalateActivity() {
	let theEscalate = escalate();
	vinter_flow.workflows[0].activities.push(theEscalate);
	publish("onescalateadded", theEscalate);
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

function getActivityByName(name) {
	let activity = vinter_flow.workflows[0].activities.filter(
		activity => activity.name === name
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

function loadActivity(activity) {
	if (activity.type === "Root") addBeginActivity(activity);
	if (activity.type === "End") addEndActivity(activity);
	if (activity.type === "Say") addSayActivity(activity);
	if (activity.type === "Form") addFormActivity(activity);
}

function init() {
	configureNewFlowBehavior();
	configureLoadBehavior();
	configureOpenJSON();
	setupFlow();
}

subscribe("oncreatesay", () => {
	console.log("oncreatesay");
	addSayActivity();
});

subscribe("oncreatedecision", () => {
	console.log("oncreatedecision");
	addDecisionActivity();
});

subscribe("oncreateform", () => {
	console.log("oncreateform");
	addFormActivity();
});

subscribe("oncreateservicecall", () => {
	console.log("oncreateservicecall");
	addServiceCallActivity();
});

subscribe("oncreatecontrolmanager", () => {
	console.log("oncreatecontrolmanager");
	addControlManagerActivity();
});

subscribe("oncreatequestion", () => {
	console.log("oncreatequestion");
	addQuestionActivity();
});

subscribe("oncreatememory", () => {
	console.log("oncreatememory");
	addMemoryActivity();
});

subscribe("oncreatecustomcode", () => {
	console.log("oncreatecustomcode");
	addCustomCodeActivity();
});

subscribe("oncreatedisconnect", () => {
	console.log("oncreatedisconnect");
	addDisconnectActivity();
});

subscribe("oncreateescalate", () => {
	console.log("oncreateescalate");
	addEscalateActivity();
});

subscribe("onshowmenu", () => {
	console.log("onshowmenu");
	openMenu();
});

init();

export {
	getBeginActivity,
	getEndActivity,
	getActivityById,
	getActivityByName,
	makeName,
	isFlowInitialized,
	changeElementDisplay,
	loadActivity
};
