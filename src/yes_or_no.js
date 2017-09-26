import { makeName, isFlowInitialized } from "./app.js";
import { subscribe, publish } from "./event.js";
import { question } from "./question.js";
import { decision } from "./decision.js";

function yesOrNo() {
	let currentQuestion = question();
	let currentDecision = decision();
	currentDecision.addNoRule();
	currentDecision.addYesRule();
	return { q: currentQuestion, d: currentDecision };
}

export { yesOrNo };
