import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

let editor = null;

class CustomCode {
	constructor() {
		this.name = makeName("CUSTOMCODE_");
		this.type = "CustomCode";
		this.nextActivity = "";
		this.script = "";
	}
}

function custom() {
	return new CustomCode();
}

const configureNewCustomCodeBehavior = () => {
	let vinterBtnCreateCustomCode = document.getElementById(
		"vinter-btn-create-custom-code"
	);
	vinterBtnCreateCustomCode.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatecustomcode", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

const configureCodemirror = () => {
	let myCCode = document.getElementById("ccode");
	editor = CodeMirror(
		elt => {
			myCCode.parentNode.replaceChild(elt, myCCode);
		},
		{
			value: "",
			mode: "groovy",
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true
		}
	);
	editor.setOption("theme", "base16-dark");
};

function init() {
	configureNewCustomCodeBehavior();
	configureCodemirror();
}

subscribe("oneditcustomcode", ccode => {
	let btnClose = document.getElementById("close-edit-ccode");
	btnClose.onclick = () => {
		changeElementDisplay("vinter-modal-edit-ccode", "none");
	};
	let btnEditCCode = document.getElementById("vinter-btn-confirm-edit-ccode");
	btnEditCCode.onclick = () => {
		console.log(editor.getValue());
	};
	changeElementDisplay("vinter-modal-edit-ccode", "block");
});

init();

export { custom };
