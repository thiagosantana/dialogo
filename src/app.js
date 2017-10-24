import { subscribe, publish } from "./event.js";
import { graphInfo, renderLink, renderPort } from "./graph.js";
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
import { startTimers } from "./timer.js";
import {
	loadExistingFlow,
	deleteExistingFlow,
	updateExistingFlow
} from "./flow_storage.js";

let vinter_flow = {};
window.flow = vinter_flow;
window.mustache = require("mustache");

hljs.initHighlightingOnLoad();

var initialized = false;

const changeElementDisplay = (elementId, newDisplay) => {
	let element = document.getElementById(elementId);
	element.style.display = newDisplay;
};

subscribe("loadfromstorage", flow => {
	console.log("load from storage");
	openFromStorage(flow);
});

loadExistingFlow();
startTimers();

const configureUndoRedoKeyboard = () => {
	console.log("Keyboard ok");
	document.addEventListener("keydown", event => {
		const keyName = event.key;
		if (keyName === "ArrowLeft") {
			undo();
		}
		if (keyName === "ArrowRight") {
			redo();
		}
	});
};

const configureLoadBehavior = () => {
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
		deleteExistingFlow();
		load(txtLoadJson.value);
		initialized = true;
		changeElementDisplay("vinter-load-json", "none");
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
		deleteExistingFlow();
		let newFlowName = document.getElementById("new-flow-name");
		let newFlowId = document.getElementById("new-flow-id");
		if (newFlowId.value && newFlowName.value) {
			initNewFlow(newFlowName.value, newFlowId.value);
			addBeginActivity();
			addEndActivity();
			changeElementDisplay("vinter-modal-new-flow", "none");
			//publish("onflowcreated", {});
			initialized = true;
		} else {
			changeElementDisplay("new-flow-error", "block");
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

function updateAutomaticSaveStatus(time) {
	let auto_save = document.getElementById("auto-save");
	auto_save.innerHTML = "Fluxo atualizado as " + time;
}

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
		let theBegin = begin();
		theBegin.x = activity.x;
		theBegin.y = activity.y;
		theBegin.nextActivity = activity.nextActivity;
		vinter_flow.workflows[0].activities.push(theBegin);
		publish("onbeginadded", theBegin);
	} else {
		let theBegin = begin();
		vinter_flow.workflows[0].activities.push(theBegin);
		publish("onbeginadded", theBegin);
	}
	updateExistingFlow();
}

function addEndActivity(activity) {
	if (activity) {
		let theEnd = end();
		theEnd.x = activity.x;
		theEnd.y = activity.y;
		vinter_flow.workflows[0].activities.push(theEnd);
		publish("onendadded", theEnd);
	} else {
		let theEnd = end();
		vinter_flow.workflows[0].activities.push(theEnd);
		publish("onendadded", theEnd);
	}
	updateExistingFlow();
}

function addSayActivity(activity) {
	if (activity) {
		let theNewSay = say();
		theNewSay.name = activity.name;
		theNewSay.nextActivity = activity.nextActivity;
		theNewSay.sleep = activity.sleep;
		theNewSay.utterance = activity.utterance;
		theNewSay.utteranceLog = activity.utteranceLog;
		theNewSay.x = activity.x;
		theNewSay.y = activity.y;
		vinter_flow.workflows[0].activities.push(theNewSay);
		publish("onsayadded", theNewSay);
	} else {
		let theNewSay = say();
		vinter_flow.workflows[0].activities.push(theNewSay);
		publish("onsayadded", theNewSay);
	}
	updateExistingFlow();
}

function addServiceCallActivity(activity) {
	if (activity) {
		let theNewServiceCall = serviceCall();
		theNewServiceCall.name = activity.name;
		theNewServiceCall.nextActivity = activity.nextActivity;
		theNewServiceCall.serviceName = activity.serviceName;
		theNewServiceCall.inputParameters = activity.inputParameters;
		theNewServiceCall.outputParameters = activity.outputParameters;
		theNewServiceCall.x = activity.x;
		theNewServiceCall.y = activity.y;
		vinter_flow.workflows[0].activities.push(theNewServiceCall);
		publish("onservicecalladded", theNewServiceCall);
	} else {
		let theNewServiceCall = serviceCall();
		vinter_flow.workflows[0].activities.push(theNewServiceCall);
		publish("onservicecalladded", theNewServiceCall);
	}
	updateExistingFlow();
}

function addControlManagerActivity(activity) {
	if (activity) {
		let theNewControlManager = controlManager();
		theNewControlManager.name = activity.name;
		theNewControlManager.nextActivity = activity.nextActivity;
		theNewControlManager.actions = activity.actions;
		theNewControlManager.x = activity.x;
		theNewControlManager.y = activity.y;
		vinter_flow.workflows[0].activities.push(theNewControlManager);
		publish("oncontrolmanageradded", theNewControlManager);
	} else {
		let theNewControlManager = controlManager();
		vinter_flow.workflows[0].activities.push(theNewControlManager);
		publish("oncontrolmanageradded", theNewControlManager);
	}
	updateExistingFlow();
}

function addFormActivity(activity) {
	if (activity) {
		let theForm = form();
		theForm.name = activity.name;
		theForm.nextActivity = activity.nextActivity;
		theForm.cancelNextActivityName = activity.cancelNextActivityName;
		theForm.utterance = activity.utterance;
		theForm.fields = activity.fields;
		theForm.validator = activity.validator;
		theForm.x = activity.x;
		theForm.y = activity.y;
		vinter_flow.workflows[0].activities.push(theForm);
		publish("onformadded", theForm);
	} else {
		let theForm = form();
		vinter_flow.workflows[0].activities.push(theForm);
		publish("onformadded", theForm);
	}
	updateExistingFlow();
}

function addDecisionActivity(activity) {
	if (activity) {
		let theDecision = decision();
		theDecision.name = activity.name;
		theDecision.defaultNextActivity = activity.defaultNextActivity;
		theDecision.rules = activity.rules;
		theDecision.x = activity.x;
		theDecision.y = activity.y;
		vinter_flow.workflows[0].activities.push(theDecision);
		publish("ondecisionadded", theDecision);
	} else {
		let theDecision = decision();
		vinter_flow.workflows[0].activities.push(theDecision);
		publish("ondecisionadded", theDecision);
	}
	updateExistingFlow();
}

function addQuestionActivity(activity) {
	if (activity) {
		let theQuestion = question();
		theQuestion.name = activity.name;
		theQuestion.question = activity.question;
		theQuestion.utterance = activity.utterance;
		theQuestion.nextActivity = activity.nextActivity;
		theQuestion.validator = activity.validator;
		theQuestion.x = activity.x;
		theQuestion.y = activity.y;
		vinter_flow.workflows[0].activities.push(theQuestion);
		publish("onquestionadded", theQuestion);
	} else {
		let theQuestion = question();
		vinter_flow.workflows[0].activities.push(theQuestion);
		publish("onquestionadded", theQuestion);
	}
	updateExistingFlow();
}

function addMemoryActivity(activity) {
	if (activity) {
		let theMemory = memory();
		theMemory.name = activity.name;
		theMemory.values = activity.values;
		theMemory.nextActivity = activity.nextActivity;
		theMemory.x = activity.x;
		theMemory.y = activity.y;
		vinter_flow.workflows[0].activities.push(theMemory);
		publish("onmemoryadded", theMemory);
	} else {
		let theMemory = memory();
		vinter_flow.workflows[0].activities.push(theMemory);
		publish("onmemoryadded", theMemory);
	}
	updateExistingFlow();
}

function addCustomCodeActivity(activity) {
	if (activity) {
		let theCustom = custom();
		theCustom.name = activity.name;
		theCustom.nextActivity = activity.nextActivity;
		theCustom.script = activity.script;
		theCustom.x = activity.x;
		theCustom.y = activity.y;
		vinter_flow.workflows[0].activities.push(theCustom);
		publish("oncustomcodeadded", theCustom);
	} else {
		let theCustom = custom();
		vinter_flow.workflows[0].activities.push(theCustom);
		publish("oncustomcodeadded", theCustom);
	}
	updateExistingFlow();
}

function addDisconnectActivity(activity) {
	if (activity) {
		let theDisconnect = disconnect();
		theDisconnect.name = activity.name;
		theDisconnect.utterance = activity.utterance;
		theDisconnect.nextActivity = activity.nextActivity;
		theDisconnect.x = activity.x;
		theDisconnect.y = activity.y;
		vinter_flow.workflows[0].activities.push(theDisconnect);
		publish("ondisconnectadded", theDisconnect);
	} else {
		let theDisconnect = disconnect();
		vinter_flow.workflows[0].activities.push(theDisconnect);
		publish("ondisconnectadded", theDisconnect);
	}
	updateExistingFlow();
}

function addEscalateActivity(activity) {
	if (activity) {
		let theEscalate = escalate();
		theEscalate.name = activity.name;
		theEscalate.utterance = activity.utterance;
		theEscalate.sleep = activity.sleep;
		theEscalate.nextActivity = activity.nextActivity;
		theEscalate.x = activity.x;
		theEscalate.y = activity.y;
		vinter_flow.workflows[0].activities.push(theEscalate);
		publish("onescalateadded", theEscalate);
	} else {
		let theEscalate = escalate();
		vinter_flow.workflows[0].activities.push(theEscalate);
		publish("onescalateadded", theEscalate);
	}
	updateExistingFlow();
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

function removeAllChilds(id) {
	let parentElement = document.getElementById(id);
	while (parentElement.firstChild) {
		parentElement.removeChild(parentElement.firstChild);
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
	configureUndoRedoKeyboard();
	configureNewFlowBehavior();
	configureLoadBehavior();
	configureOpenJSON();
	setupFlow();
}

function removeFromActivityArray(activityID) {
	for (var i in vinter_flow.workflows[0].activities) {
		if (vinter_flow.workflows[0].activities[i].id === activityID) {
			vinter_flow.workflows[0].activities.splice(i, 1);
		}
	}
}

function load(strJson) {
	let objJson = JSON.parse(strJson);
	objJson.workflows[0].activities.forEach(activity => {
		if (activity.type === "Root") addBeginActivity(activity);
		if (activity.type === "End") addEndActivity(activity);
		//publish("onflowcreated", {});
		if (activity.type === "Say") addSayActivity(activity);
		if (activity.type === "Form") addFormActivity(activity);
		if (activity.type === "CustomCode") addCustomCodeActivity(activity);
		if (activity.type === "QuestionAnswer") addQuestionActivity(activity);
		if (activity.type === "DecisionSwitch") addDecisionActivity(activity);
		if (activity.type === "SetMemory") addMemoryActivity(activity);
		if (activity.type === "ServiceCall") addServiceCallActivity(activity);
		if (activity.type === "Disconnect") addDisconnectActivity(activity);
		if (activity.type === "Escalate") addEscalateActivity(activity);
		if (activity.type === "ClientControlManagement")
			addControlManagerActivity(activity);

		initialized = true;
	});

	console.log(objJson);
}

function openFromStorage(flow) {
	console.log("open from storage");
	changeElementDisplay("vinter-modal-load-storage", "block");
	let sim = document.getElementById("vinter-btn-sim");
	let nao = document.getElementById("vinter-btn-nao");
	sim.onclick = () => {
		load(flow);
		changeElementDisplay("vinter-modal-load-storage", "none");
	};
	nao.onclick = () => {
		changeElementDisplay("vinter-modal-load-storage", "none");
	};
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

subscribe("ondeleteactivity", id => {
	removeFromActivityArray(id);
	updateExistingFlow();
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
	loadActivity,
	removeAllChilds,
	updateAutomaticSaveStatus,
	load
};
