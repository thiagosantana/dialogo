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
	addRuleValidation() {}
}

function createOptionEntry() {
	$("#vinter-div-question-option").append(
		"<div><label>Opção</label><input/></div>"
	);
}

function createRuleEntry() {
	$("#vinter-div-question-option").append(
		"<select><option value='vl1'>vl1</option><option value='vl1'>vl1</option></select>"
	);
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
	btnAddOption.onclick = () => {
		createOptionEntry();
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
			changeElementDisplay("vinter-modal-edit-question", "none");
		} else {
			alert("Vc precisa definir uma uterrance!");
		}
	};
}

const onEditQuestion = question => {
	configureCloseBtn();
	showEditDialog();
	configureEditQuestionBehavior(question);
};

subscribe("oneditquestion", onEditQuestion);
export { question };
