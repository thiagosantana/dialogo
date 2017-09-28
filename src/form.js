import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

let max_fields = 10;
let current_field = 1;

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

const addFieldSet = () => {
	let wrapper = document.getElementById("dynamic-fields");
	let add_button = document.getElementById("vinter-btn-add-field");

	add_button.onclick = e => {
		console.log("Dynamic Form");
		e.preventDefault();
		let div = document.createElement("div");
		div.setAttribute("class", "vinter-form-field");
		let txtField = document.createElement("input");
		txtField.placeholder = "Field name";
		div.appendChild(txtField);
		wrapper.appendChild(div);
	};
};

function init() {
	configureNewFormBehavior();
	addFieldSet();
}

init();

const onEditForm = form => {
	let wrapper = document.getElementById("dynamic-fields");
	let vinterCloseEditForm = document.getElementById("close-edit-form");
	vinterCloseEditForm.onclick = () => {
		changeElementDisplay("vinter-modal-edit-form", "none");
	};
	let txtUtterance = document.getElementById("edit-form-utterance");
	txtUtterance.value = form.utterance;
	let btnEditForm = document.getElementById("vinter-btn-confirm-edit-form");
	btnEditForm.onclick = () => {
		form.utterance = txtUtterance.value;
		wrapper.childNodes.forEach(node => {
			node.childNodes.forEach(input => {
				if (input.value) {
					form.addField({
						nome: input.value,
						label: input.value,
						type: "Text",
						size: 50,
						value: "",
						maxLength: 20,
						mask: ""
					});
				}
			});
		});
		//removendo os elementos(fields) adcionados
		while (wrapper.firstChild) {
			wrapper.removeChild(wrapper.firstChild);
		}
		changeElementDisplay("vinter-modal-edit-form", "none");
		txtUtterance.value = "";
	};
	changeElementDisplay("vinter-modal-edit-form", "block");
};

subscribe("oneditform", onEditForm);

export { form };
