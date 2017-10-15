import {
	getBeginActivity,
	getEndActivity,
	getActivityById,
	getActivityByName,
	loadActivity
} from "./app.js";
import { subscribe, publish } from "./event.js";

window.$ = require("jquery");
window.joint = require("jointjs");

let cellViewForEdit = null;

let graph = new joint.dia.Graph();
let paper = new joint.dia.Paper({
	el: $("#vinter-graph"),
	highlighting: {
		default: {
			name: "stroke",
			options: {
				padding: 3
			}
		},
		connecting: {
			name: "addClass",
			options: {
				className: "highlight-connecting"
			}
		}
	},
	width: window.innerWidth - 15,
	height: window.innerHeight * 1.25,
	model: graph,
	gridSize: 10,
	defaultLink: new joint.dia.Link({
		attrs: {
			".marker-target": {
				d: "M 10 0 L 0 5 L 10 10 z",
				fill: "#7C90A0"
			},
			".connection": { "stroke-width": 3, stroke: "black" }
		},
		router: { name: "manhattan" },
		connector: { name: "rounded" }
	}),
	validateConnection: function(
		cellViewS,
		magnetS,
		cellViewT,
		magnetT,
		end,
		linkView
	) {
		// Prevent linking from input ports.
		if (magnetS && magnetS.getAttribute("port-group") === "in")
			return false;
		// Prevent linking from output ports to input ports within one element.
		if (cellViewS === cellViewT) return false;
		// Prevent linking to input ports.
		return magnetT && magnetT.getAttribute("port-group") === "in";
	},
	validateMagnet: function(cellView, magnet) {
		// Prevent links from ports that already have a link
		var port = magnet.getAttribute("port");
		var links = graph.getConnectedLinks(cellView.model, {
			outbound: true
		});
		var portLinks = _.filter(links, function(o) {
			return o.get("source").port == port;
		});
		if (portLinks.length > 0) return false;
		// Note that this is the default behaviour. Just showing it here for reference.
		// Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
		return magnet.getAttribute("magnet") !== "passive";
	},
	snapLinks: { radius: 60 },
	markAvailable: true,
	gridSize: 10,
	drawGrid: true
});

let selected = false;

let highlighter = {
	highlighter: {
		name: "addClass",
		options: {
			className: "highlighted"
		}
	}
};

window.g = graph;
window.p = paper;

paper.on("cell:pointerclick", cellView => {
	let activity = getActivityById(cellView.model.id);
	//console.log(cellView.model.id);
	console.log(activity);
	if (activity.type === "Say") publish("oneditsay", activity);
	if (activity.type === "Form") publish("oneditform", activity);
	if (activity.type === "CustomCode") publish("oneditcustomcode", activity);
	if (activity.type === "QuestionAnswer") publish("oneditquestion", activity);
	if (activity.type === "DecisionSwitch") publish("oneditdecision", activity);
	if (activity.type === "SetMemory") publish("oneditmemory", activity);
	if (activity.type === "ServiceCall") publish("oneditservice", activity);
	if (activity.type === "Disconnect") publish("oneditdisconnect", activity);
	if (activity.type === "Escalate") publish("oneditescalate", activity);

	cellViewForEdit = cellView;
});

paper.on("cell:pointerup", (cellView, evt, x, y) => {
	removeIlegalLinksWhenTargetPointsNull();
});

graph.on("change:source change:target", function(link) {});

paper.on("link:connect", (link, evt, target) => {
	updateWorkflowConnections(link, evt, target);
});

graph.on("remove", function(cell, collection, opt) {
	if (cell.isLink()) {
		console.log("link removed", cell);
	}
});

function load(json) {
	try {
		let loadedJSON = JSON.parse(json);
		renderJSON(loadedJSON);
	} catch (e) {
		alert("JSON com problemas");
		console.log(e);
	}
}

function renderJSON(json) {
	json.workflows[0].activities.forEach(activity => {
		loadActivity(activity);
		if (activity.type === "Root") {
			renderBegin();
		} else if (activity.type === "End") {
			renderEnd();
		}
	});

	json.workflows[0].activities.forEach(activity => {
		if (activity.nextActivity) {
			renderLink(
				activity.id,
				getActivityByName(activity.nextActivity).id
			);
		}
	});
}

function renderLink(sourceID, targetID) {
	let link = new joint.dia.Link({
		source: { id: sourceID },
		target: { id: targetID },
		attrs: {
			".marker-target": {
				d: "M 10 0 L 0 5 L 10 10 z",
				fill: "#7C90A0"
			},
			".connection": { "stroke-width": 3, stroke: "black" }
		},
		router: { name: "manhattan" },
		connector: { name: "rounded" }
	});
	graph.addCell(link);
}

function renderBegin() {
	let begin = getBeginActivity();
	let model = new joint.shapes.devs.Model({
		position: { x: 30, y: 30 },
		size: { width: 27, height: 27 },
		outPorts: ["nextActivity"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					},
					position: "top"
				},
				out: {
					attrs: {
						".port-body": {
							fill: "#B9B7A7"
						}
					},
					position: "bottom"
				}
			}
		},
		attrs: {
			text: {
				text: "",
				fill: "white",
				"font-weight": "bold",
				"text-transform": "capitalize",
				"font-size": 16
			},
			rect: { fill: "green", "stroke-width": 0, stroke: "black" }
		}
	});
	graph.addCell(model);
	begin.id = model.id;
}

function renderEnd() {
	let end = getEndActivity();
	let model = new joint.shapes.devs.Model({
		position: { x: 300, y: 500 },
		size: { width: 27, height: 27 },
		inPorts: [""],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					},
					position: "top"
				},
				out: {
					attrs: {
						".port-body": {
							fill: "#B9B7A7"
						}
					}
				}
			}
		},
		attrs: {
			text: {
				text: "",
				fill: "white",
				"font-weight": "bold",
				"text-transform": "capitalize",
				"font-size": 16
			},
			rect: { fill: "red", "stroke-width": 0, stroke: "black" }
		}
	});
	graph.addCell(model);
	end.id = model.id;
}

function renderSay(say) {
	let model = new joint.shapes.devs.Model({
		position: { x: 150, y: 150 },
		size: { width: 44, height: 43 },
		inPorts: [""],
		outPorts: ["nextActivity"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					},
					position: "top"
				},
				out: {
					attrs: {
						".port-body": {
							fill: "#B9B7A7"
						}
					},
					position: "bottom"
				}
			}
		},
		attrs: {
			text: {
				text: say.type,
				fill: "white",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 12
			},
			rect: { fill: "black", "stroke-width": 2, stroke: "gray" }
		}
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderForm(form) {
	let model = new joint.shapes.devs.Model({
		position: { x: 150, y: 150 },
		size: { width: 50, height: 45 },
		inPorts: [""],
		outPorts: ["nextActivity", "cancelNextActivityName"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					},
					position: "left"
				},
				out: {
					attrs: {
						".port-body": {
							fill: "#B9B7A7"
						}
					}
				}
			}
		},
		attrs: {
			text: {
				text: form.type,
				fill: "white",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 13
			},
			rect: { fill: "blue", "stroke-width": 2, stroke: "black" }
		}
	});
	graph.addCell(model);
	form.id = model.id;
}

function renderDecision(decision) {
	let model = new joint.shapes.devs.Model({
		position: { x: 150, y: 150 },
		size: { width: 27, height: 120 },
		inPorts: [""],
		outPorts: ["defaultNextActivity"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					},
					position: "top"
				},
				out: {
					attrs: {
						".port-body": {
							fill: "#B9B7A7"
						}
					}
				}
			}
		},
		attrs: {
			text: {
				text: "DS",
				fill: "white",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 13
			},
			rect: { fill: "black", "stroke-width": 1, stroke: "gray" }
		}
	});
	graph.addCell(model);
	decision.id = model.id;
}

function updateWorkflowConnections(currentLink, evt, target) {
	console.log("Just Connected", currentLink.model.get("source").port);
	graph.getLinks().forEach(link => {
		let sourceID = link.attributes.source.id;
		let targetID = link.attributes.target.id;
		let activitySource = getActivityById(sourceID);
		let activityTarget = getActivityById(targetID);
		if (link.get("source").port === "nextActivity")
			activitySource.nextActivity = activityTarget.name;
		if (link.get("source").port === "cancelNextActivityName")
			activitySource.cancelNextActivityName = activityTarget.name;
		if (link.get("source").port === "defaultNextActivity")
			activitySource.defaultNextActivity = activityTarget.name;
		else {
			let customPort = link.get("source").port;
			if (activitySource.type === "DecisionSwitch") {
				activitySource.rules.forEach(rule => {
					if (rule.label === customPort) {
						rule.nextActivity = activityTarget.name;
					}
				});
			}
		}
	});
}

function removeIlegalLinksWhenTargetPointsNull() {
	graph.getLinks().forEach(link => {
		if (link.getTargetElement() === null) {
			link.remove();
		}
	});
}

const onFlowCreated = () => {
	renderBegin();
	renderEnd();
};

const onSayAdded = say => {
	renderSay(say);
};

const onFormAdded = form => {
	renderForm(form);
};

const onServiceCallAdded = serviceCall => {
	renderSay(serviceCall); //only for test purpose
};

const onControlManagerAdded = controlManager => {
	renderSay(controlManager); //only for test purpose
};

const onDecisionAdded = decision => {
	renderDecision(decision); //only for test purpose
};

const onQuestionAdded = question => {
	renderSay(question); //only for test purpose
};

const onMemoryAdded = memory => {
	renderSay(memory); //only for test purpose
};

const onCustomCodeAdded = custom => {
	renderSay(custom); //only for test purpose
};

const onDisconnectAdded = disconnect => {
	renderSay(disconnect); //only for test purpose
};

const onEscalateAdded = escalate => {
	renderSay(escalate);
};

const onMenuActivityClose = () => {
	removeIlegalLinksWhenTargetPointsNull();
};

subscribe("onflowcreated", onFlowCreated);
subscribe("onsayadded", onSayAdded);
subscribe("onformadded", onFormAdded);
subscribe("onservicecalladded", onServiceCallAdded);
subscribe("oncontrolmanageradded", onControlManagerAdded);
subscribe("ondecisionadded", onDecisionAdded);
subscribe("onquestionadded", onQuestionAdded);
subscribe("onmemoryadded", onMemoryAdded);
subscribe("oncustomcodeadded", onCustomCodeAdded);
subscribe("ondisconnectadded", onDisconnectAdded);
subscribe("onescalateadded", onEscalateAdded);
subscribe("onmenuactivityclose", onMenuActivityClose);

subscribe("ondeleteactivity", id => {
	removeConnectedLinks(id);
	cellViewForEdit.remove();
	cellViewForEdit = null;
});

subscribe("updatedecisiongraph", label => {
	let portsArray = cellViewForEdit.model.get("outPorts");
	cellViewForEdit.model.set("outPorts", portsArray.concat(label));
});

function removeConnectedLinks(id) {
	graph.getLinks().forEach(link => {
		if (link.getTargetElement().id === id) {
			link.remove();
		}
		if (link.attributes.source.id === id) {
			link.remove();
		}
	});
}

export { load };
