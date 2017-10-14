import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Decision {
	constructor() {
		this.name = makeName("DECISION_");
		this.type = "DecisionSwitch";
		this.defaultNextActivity = "";
		this.rules = [];
	}

	addRule(rule) {
		this.rules.push({
			rule: rule,
			nextActivity: "",
			utterance: ""
		});
	}

	addYesRule() {
		this.rules.push({
			rule: 'api.getMemory("UTTERANCE.CURRENT").equals("SIM")',
			nextActivity: "",
			utterance: ""
		});
	}

	addNoRule() {
		this.rules.push({
			rule: 'api.getMemory("UTTERANCE.CURRENT").equals("NAO")',
			nextActivity: "",
			utterance: ""
		});
	}
}

function decision() {
	return new Decision();
}

const configureNewDecisionBehavior = () => {
	let vinterBtnCreateDecision = document.getElementById(
		"vinter-btn-create-decision"
	);
	vinterBtnCreateDecision.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatedecision", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

const onEditDecision = decision => {
	changeElementDisplay("vinter-modal-edit-decision", "block");
	let btnCloseModal = document.getElementById("close-edit-decision");
	let btnAddRule = document.getElementById("vinter-btn-add-decision-rule");
	let btnEdit = document.getElementById("vinter-btn-edit-decision");
	btnCloseModal.onclick = () => {
		changeElementDisplay("vinter-modal-edit-decision", "none");
	};
	btnAddRule.onclick = createRuleEntry;
	btnEdit.onclick = () => {
		let rules = document.querySelectorAll("#vinter-div-decision-rule div");
		rules.forEach(div => {
			decision.addRule(extractRuleDefinition(div));
		});
		changeElementDisplay("vinter-modal-edit-decision", "none");
	};
};

subscribe("oneditdecision", onEditDecision);

function init() {
	configureNewDecisionBehavior();
}

function createRuleEntry() {
	$("#vinter-div-decision-rule").append(
		"<div>" +
			"<select>" +
			"<option value='nope'> </option>" +
			"<option value='not'>!</option>" +
			"</select>" +
			"<select>" +
			"<option value='api.getMemory'>api.getMemory</option>" +
			"<option value='api.getDialogMemory'>api.getDialogMemory</option>" +
			"</select>" +
			"<input/>" +
			"<select>" +
			"<option value='equals'>equals</option>" +
			"<option value='contains'>contains</option>" +
			"<option value='equalsIgnoreCase'>equalsIgnoreCase</option>" +
			"</select>" +
			"<input/>" +
			"</div>"
	);
}

function extractRuleDefinition(div) {
	let ruleDefinition = "";
	div.childNodes.forEach((element, index) => {
		if (index === 0 && element.value === "not") {
			ruleDefinition = "!";
		}
		if (index === 1) {
			ruleDefinition += element.value + '("#VAR")';
		}
		if (index === 2) {
			ruleDefinition = ruleDefinition.replace("#VAR", element.value);
		}
		if (index === 3) {
			ruleDefinition += "." + element.value + '("#VALUE") ';
		}
		if (index === 4) {
			ruleDefinition = ruleDefinition.replace("#VALUE", element.value);
		}
	});
	return ruleDefinition;
}

init();
export { decision };
