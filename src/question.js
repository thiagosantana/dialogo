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

export { question };
