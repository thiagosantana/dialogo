import {
	getBeginActivity,
	getEndActivity,
	getActivityById,
	getActivityByName,
	loadActivity
} from "./app.js";
import { subscribe, publish } from "./event.js";
import { updateExistingFlow } from "./flow_storage.js";

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
	height: window.innerHeight * 0.9,
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
let dragStartPosition = null;
//let scale = 1;
let scale = V(paper.viewport).scale();

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

$("#vinter-graph").mousemove(event => {
	if (dragStartPosition) {
		let nextX = event.offsetX - dragStartPosition.x;
		let nextY = event.offsetY - dragStartPosition.y;
		paper.setOrigin(
			event.offsetX - dragStartPosition.x,
			event.offsetY - dragStartPosition.y
		);
	}
});

paper.on("cell:mouseover", param1 => {
	console.log(param1);
});

paper.on("cell:pointerclick", cellView => {
	let activity = getActivityById(cellView.model.id);
	if (activity.type === "Say") publish("oneditsay", activity);
	if (activity.type === "Form") publish("oneditform", activity);
	if (activity.type === "CustomCode") publish("oneditcustomcode", activity);
	if (activity.type === "QuestionAnswer") publish("oneditquestion", activity);
	if (activity.type === "DecisionSwitch") publish("oneditdecision", activity);
	if (activity.type === "SetMemory") publish("oneditmemory", activity);
	if (activity.type === "ServiceCall") publish("oneditservice", activity);
	if (activity.type === "Disconnect") publish("oneditdisconnect", activity);
	if (activity.type === "Escalate") publish("oneditescalate", activity);
	if (activity.type === "ClientControlManagement")
		publish("oneditcontrolmgmt", activity);

	cellViewForEdit = cellView;
});

paper.on("cell:pointerup", (cellView, evt, x, y) => {
	removeIlegalLinksWhenTargetPointsNull();
});

graph.on("change:source change:target", function(link) {});

paper.on("link:connect", (link, evt, target) => {
	updateWorkflowConnections(link, evt, target);
	updateExistingFlow();
});

graph.on("remove", function(cell, collection, opt) {
	if (cell.isLink()) {
		console.log("link removed", cell);
	}
});

paper.on("blank:pointerdown", (event, x, y) => {
	dragStartPosition = { x: x, y: y };
	//dragStartPosition = { x: x * scale.sx, y: y * scale.sy };
	document.getElementById("app").style.cursor = "move";
});

paper.on("cell:pointerup blank:pointerup", function(cellView, x, y) {
	dragStartPosition = null;
	document.getElementById("app").style.cursor = "default";
});

function graphInfo(json) {}

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

function updatePosition() {}

function renderPort(cellID, portLabel) {
	let dsCell = getCell(cellID);
	let portsArray = dsCell.get("outPorts");
	dsCell.set("outPorts", portsArray.concat(portLabel));
}

function renderLink(sourceID, targetID, label) {
	let link = new joint.shapes.devs.Link({
		source: { id: sourceID, port: label },
		target: { id: targetID, port: " " },
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

function renderRuleLink(sourceID, targetID, label) {
	let decisionCell = getCell(sourceID);
	decisionCell.get("ports").items.forEach();
	let link = new joint.shapes.devs.Link({
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

function getCell(id) {
	let theCell = null;
	graph.getCells().forEach(cell => {
		if (cell.id === id) {
			theCell = cell;
		}
	});
	return theCell;
}

function renderBegin(begin) {
	let positionX = -1;
	let positionY = -1;
	if (begin.x && begin.y) {
		positionX = begin.x;
		positionY = begin.y;
	} else {
		positionX = 30;
		positionY = 30;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
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
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	begin.id = model.id;
}

function renderEnd(end) {
	let positionX = -1;
	let positionY = -1;
	if (end.x && end.y) {
		positionX = end.x;
		positionY = end.y;
	} else {
		positionX = 300;
		positionY = 300;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
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
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	end.id = model.id;
}

function renderSay(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 44, height: 43 },
		inPorts: [" "],
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
				fill: "black",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 12
			},
			rect: { fill: "#FCBFB7", "stroke-width": 2, stroke: "gray" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderEscalate(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 44, height: 43 },
		inPorts: [" "],
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
			rect: { fill: "#331E36", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderCustom(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 68, height: 43 },
		inPorts: [" "],
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
				fill: "black",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 12
			},
			rect: { fill: "#F6E27F", "stroke-width": 2, stroke: "#A8B7AB" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderDisconnect(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 59, height: 38 },
		inPorts: [" "],
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
			rect: { fill: "#334E58", "stroke-width": 2, stroke: "gray" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderService(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 70, height: 38 },
		inPorts: [" "],
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
			rect: { fill: "#931621", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderControl(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 135, height: 38 },
		inPorts: [" "],
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
				fill: "black",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 12
			},
			rect: { fill: "#88665D", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderMemory(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 100, height: 38 },
		inPorts: [" "],
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
			rect: { fill: "#785589", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderQuestion(say) {
	let positionX = -1;
	let positionY = -1;
	if (say.x && say.y) {
		positionX = say.x;
		positionY = say.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 110, height: 38 },
		inPorts: [" "],
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
				fill: "#8E9AAF",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 12
			},
			rect: { fill: "#AFFC41", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	say.id = model.id;
}

function renderForm(form) {
	let positionX = -1;
	let positionY = -1;
	if (form.x && form.y) {
		positionX = form.x;
		positionY = form.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 50, height: 45 },
		inPorts: [" "],
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
				fill: "black",
				"font-weight": "",
				"text-transform": "capitalize",
				"font-size": 13
			},
			rect: { fill: "#C6D2ED", "stroke-width": 2, stroke: "black" }
		}
	});
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
	});
	graph.addCell(model);
	form.id = model.id;
}

function renderDecision(decision) {
	let positionX = -1;
	let positionY = -1;
	if (decision.x && decision.y) {
		positionX = decision.x;
		positionY = decision.y;
	} else {
		positionX = 150;
		positionY = 150;
	}
	let model = new joint.shapes.devs.Model({
		position: { x: positionX, y: positionY },
		size: { width: 27, height: 120 },
		inPorts: [" "],
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
	model.on("change:position", (element, position) => {
		let activity = getActivityById(element.id);
		activity.x = position.x;
		activity.y = position.y;
		updateExistingFlow();
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
	renderService(serviceCall); //only for test purpose
};

const onControlManagerAdded = controlManager => {
	renderControl(controlManager); //only for test purpose
};

const onDecisionAdded = decision => {
	renderDecision(decision); //only for test purpose
};

const onQuestionAdded = question => {
	renderQuestion(question); //only for test purpose
};

const onMemoryAdded = memory => {
	renderMemory(memory); //only for test purpose
};

const onCustomCodeAdded = custom => {
	renderCustom(custom); //only for test purpose
};

const onDisconnectAdded = disconnect => {
	renderDisconnect(disconnect); //only for test purpose
};

const onEscalateAdded = escalate => {
	renderEscalate(escalate);
};

const onEndAdded = end => {
	renderEnd(end);
};

const onBeginAdded = begin => {
	renderBegin(begin);
};

const onMenuActivityClose = () => {
	removeIlegalLinksWhenTargetPointsNull();
};

//subscribe("onflowcreated", onFlowCreated);
subscribe("onbeginadded", onBeginAdded);
subscribe("onendadded", onEndAdded);
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

export { graphInfo, renderLink, renderPort };
