import { makeName, isFlowInitialized } from "./app.js";
import { subscribe, publish } from "./event.js";

class Form {
	constructor() {
		this.name = makeName("FORM_");
		this.type = "Form";
		this.noMatchType = "1";
		this.noMatchUtterance =
			"Por favor, clique em confirmar ou cancelar para continuar.";
		this.nextActivity = "";
		this.cancelNextActivityName = "";
		this.label = "";
		this.customHTMLForm = "";
		this.utterance = "Utterance...";
		this.utteranceCancel = "";
		this.utteranceLog = "";
		this.layout = "VERTICAL";
		this.fieldsScope = "DIALOG";
		this.fields = [];
		this.validator = {
			maxAttemptExceededWorkFlowAction: "CANCEL",
			maxAttemptExceededUtterance:
				"Número máximo de tentativas excedido. Posso ajudar em algo mais?",
			maxAttempt: 5,
			items: []
		};
	}
	addField(field) {
		this.fields.push(field);
	}
	removeField(field) {
		let newFields = this.fields.filter(f => {
			f.name !== field.name;
		});
		this.fields = newFields;
	}
	addValidator(validator) {
		this.validator.items.push(validator);
	}
}

function form() {
	return new Form();
}

const configureNewFormBehavior = () => {
	let vinterBtnCreateForm = document.getElementById("vinter-btn-create-form");
	vinterBtnCreateForm.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreateform", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewFormBehavior();
}

init();

export { form };
