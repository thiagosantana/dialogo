import { makeName, isFlowInitialized } from "./app.js";
import { subscribe, publish } from "./event.js";

class Decision {
	constructor() {
		this.name = makeName("DECISION_");
		this.type = "DecisionSwitch";
		this.defaultNextActivity = "";
		this.rules = [];
	}

	addRule(rule) {
		this.rules.push(rule);
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

export { decision };
