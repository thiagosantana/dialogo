import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class ServiceCall {
	constructor() {
		this.name = makeName("SERVICE_CALL_");
		this.type = "ServiceCall";
		this.nextActivity = "";
		this.retries = "0";
		this.async = "false";
		this.utteranceError = "";
		this.serviceName = "";
		this.outputParametersScope = "DIALOG";
		this.inputParameters = [];
		this.outputParameters = [];
	}

	addInputParameter(input) {
		this.inputParameters.push(input);
	}

	addOutputParameter(output) {
		this.outputParameters.push(output);
	}
}

function serviceCall() {
	return new ServiceCall();
}

const configureNewServiceCallBehavior = () => {
	let vinterBtnCreateServiceCall = document.getElementById(
		"vinter-btn-create-service-call"
	);
	vinterBtnCreateServiceCall.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreateservicecall", {});
		} else {
			alert("Fluxo ainda não ativo.");
		}
	};
};

function init() {
	configureNewServiceCallBehavior();
}

function showServiceModal() {
	changeElementDisplay("vinter-modal-edit-service", "block");
}

function configureCloseBtn() {
	let closeBtn = document.getElementById("close-edit-service");
	closeBtn.onclick = () => {
		changeElementDisplay("vinter-modal-edit-service", "none");
	};
}

function createInputEntry() {
	$("#service-input-fields").append(
		"<div><label>Nome:</label><input/><label>Valor:</label><input/></div>"
	);
}

function createOutputEntry() {
	$("#service-output-fields").append(
		"<div><label>Nome:</label><input/></div>"
	);
}

function configureBtnAddInputEntry() {
	let btnAddInput = document.getElementById("add-input");
	btnAddInput.onclick = createInputEntry;
}

function configureBtnAddOutputEntry() {
	let btnAddOutput = document.getElementById("add-output");
	btnAddOutput.onclick = createOutputEntry;
}

function configureBtnEditService(memory) {
	let btnEdit = document.getElementById("vinter-btn-confirm-edit-service");
	btnEdit.onclick = () => {
		let txt = document.getElementById("edit-servicename");
		memory.serviceName = txt.value;
		document.querySelectorAll("#service-input-fields div").forEach(div => {
			let name = div.querySelectorAll("input")[0].value;
			let value = div.querySelectorAll("input")[1].value;
			memory.addInputParameter({
				name: name,
				value: value,
				type: "String"
			});
		});
		document.querySelectorAll("#service-output-fields div").forEach(div => {
			let name = div.querySelectorAll("input")[0].value;
			memory.addOutputParameter({
				name: name,
				value: "",
				type: "String"
			});
		});
		changeElementDisplay("vinter-modal-edit-service", "none");
	};
}

function configureBtnDeleteService(service) {
	let btnDelete = document.getElementById(
		"vinter-btn-confirm-delete-service"
	);
	btnDelete.onclick = () => {
		changeElementDisplay("vinter-modal-edit-service", "none");
		publish("ondeleteactivity", service.id);
	};
}

const onEditService = service => {
	showServiceModal();
	configureCloseBtn();
	configureBtnAddInputEntry();
	configureBtnAddOutputEntry();
	configureBtnEditService(service);
	configureBtnDeleteService(service);
};

subscribe("oneditservice", onEditService);

init();

export { serviceCall };
