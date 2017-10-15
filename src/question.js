import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Question {
	constructor() {
		this.name = makeName("QuestionAnswer_");
		this.type = "QuestionAnswer";
		this.utterance = "Loren...";
		this.nextActivity = "";
		this.validator = {
			maxAttemptExcededWorkFlowAction: "CANCEL",
			maxAttemptExcededUtterance:
				"Número máximo de tentativas excedido. Posso ajudar em algo mais?",
			maxAttempt: 10,
			items: [
				{
					name: "SimpleValidator",
					rule: "",
					validateTrueUtterance: "",
					validateFalseUtterance:
						"Por favor, escolha uma das opções acima.",
					validateExceptionUtterance:
						"Houve um erro ao processar sua solicitação! Por favor tente mais tarde!",
					validateFalseWorkFlowAction: "WAIT",
					validateExceptionWorkFlowAction: "TERMINATE"
				}
			]
		};
	}
	addOption(label) {
		let obj = {
			opt: label
		};
		let snippet = mustache.render(
			'&lt;a onclick="AVI.API.Ask(&#39;{{opt}}&#39;)"&gt;{{opt}}&lt;/a&gt;',
			obj
		);
		this.utterance += snippet;
	}
	addRule(rule) {
		this.validator.items[0].rule += rule;
	}
	addRuleValidation() {}
}

function createOptionEntry() {
	$("#vinter-div-question-option").append(
		"<div><label>Opção</label><input/></div>"
	);
}

function createRuleEntry() {
	$("#vinter-div-question-rule").append(
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
			"<select>" +
			"<option value='nope'> </option>" +
			"<option value='||'>||</option>" +
			"<option value='&&'>&&</option>" +
			"</select>" +
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
		if (index === 5 && element.value !== "nope") {
			ruleDefinition += element.value + " ";
		}
	});
	return ruleDefinition;
}

function question() {
	return new Question();
}

const configureNewQuestionBehavior = () => {
	let vinterBtnCreateQuestion = document.getElementById(
		"vinter-btn-create-question"
	);
	vinterBtnCreateQuestion.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatequestion", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewQuestionBehavior();
}

init();

function showEditDialog() {
	changeElementDisplay("vinter-modal-edit-question", "block");
}

function configureCloseBtn() {
	let vinterBtnCloseEditQuestionDialog = document.getElementById(
		"close-edit-question"
	);
	vinterBtnCloseEditQuestionDialog.onclick = () => {
		changeElementDisplay("vinter-modal-edit-question", "none");
	};
}

function configureEditQuestionBehavior(question) {
	let btnAddOption = document.getElementById("vinter-btn-add-option");
	let btnAddRule = document.getElementById("vinter-btn-add-rule");
	btnAddOption.onclick = () => {
		createOptionEntry();
	};
	btnAddRule.onclick = () => {
		createRuleEntry();
	};
	let btnEdit = document.getElementById("vinter-btn-edit-question");
	let txtUtterance = document.getElementById("edit-question-utterance");
	txtUtterance.value = question.utterance;
	btnEdit.onclick = () => {
		if (txtUtterance.value) {
			question.utterance = txtUtterance.value;
			let options = document.querySelectorAll(
				"#vinter-div-question-option div input"
			);
			options.forEach(opt => {
				question.addOption(opt.value);
			});
			let rules = document.querySelectorAll(
				"#vinter-div-question-rule div"
			);
			rules.forEach(div => {
				question.addRule(extractRuleDefinition(div));
			});
			changeElementDisplay("vinter-modal-edit-question", "none");
		} else {
			alert("Vc precisa definir uma uterrance!");
		}
	};
}

function configureDeleteQuestion(question) {
	let btnDelete = document.getElementById(
		"vinter-btn-confirm-delete-question"
	);
	btnDelete.onclick = () => {
		changeElementDisplay("vinter-modal-edit-question", "none");
		publish("ondeleteactivity", question.id);
	};
}

const onEditQuestion = question => {
	configureCloseBtn();
	showEditDialog();
	configureEditQuestionBehavior(question);
	configureDeleteQuestion(question);
};

subscribe("oneditquestion", onEditQuestion);
export { question };
