import { makeName, isFlowInitialized } from "./app.js";
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

init();

export { serviceCall };
