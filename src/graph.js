import { getBeginActivity, getEndActivity, getActivityById } from "./app.js";
import { subscribe, publish } from "./event.js";

window.$ = require("jquery");
window.joint = require("jointjs");

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
	height: window.innerHeight * 0.85,
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
	if (activity.type === "Say") publish("oneditsay", activity);
});

paper.on("cell:pointerup", (cellView, evt, x, y) => {
	removeIlegalLinksWhenTargetPointsNull();
});

paper.on("link:connect", (link, evt, target) => {
	updateWorkflowConnections();
});

function load(json) {
	console.log("TODO");
	console.log("TODO");
}

function renderBegin() {
	let begin = getBeginActivity();
	let model = new joint.shapes.devs.Model({
		position: { x: 30, y: 30 },
		size: { width: 50, height: 50 },
		outPorts: ["nextActivity"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					}
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
			rect: { fill: "black", "stroke-width": 5, stroke: "gray" }
		}
	});
	graph.addCell(model);
	begin.id = model.id;
}

function renderEnd() {
	let end = getEndActivity();
	let model = new joint.shapes.devs.Model({
		position: { x: 80, y: 80 },
		size: { width: 50, height: 50 },
		inPorts: [""],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					}
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
			rect: { fill: "black", "stroke-width": 5, stroke: "gray" }
		}
	});
	graph.addCell(model);
	end.id = model.id;
}

function renderSay(say) {
	let model = new joint.shapes.devs.Model({
		position: { x: 150, y: 150 },
		size: { width: 50, height: 50 },
		inPorts: [""],
		outPorts: ["nextActivity"],
		ports: {
			groups: {
				in: {
					attrs: {
						".port-body": {
							fill: "#16A085"
						}
					}
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
			rect: { fill: "black", "stroke-width": 5, stroke: "gray" }
		}
	});
	graph.addCell(model);
	say.id = model.id;
}

function updateWorkflowConnections() {
	graph.getLinks().forEach(link => {
		let sourceID = link.attributes.source.id;
		let targetID = link.attributes.target.id;
		let activitySource = getActivityById(sourceID);
		let activityTarget = getActivityById(targetID);
		activitySource.nextActivity = activityTarget.name;
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
	renderSay(form);
};

const onServiceCallAdded = serviceCall => {
	renderSay(serviceCall); //only for test purpose
};

const onControlManagerAdded = controlManager => {
	renderSay(controlManager); //only for test purpose
};

const onDecisionAdded = decision => {
	renderSay(decision); //only for test purpose
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

export { load };
