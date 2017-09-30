import { makeName, isFlowInitialized } from "./app.js";
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
		changeElementDisplay("vinter-modal-edit-say", "none");
	};
}
const onEditQuestion = () => {
	configureCloseBtn();
	showEditDialog();
};

subscribe("oneditquestion", onEditQuestion);
export { question };
