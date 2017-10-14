import { makeName, isFlowInitialized, changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

class Memory {
	constructor() {
		this.type = "SetMemory";
		this.name = makeName("MEMORY_");
		this.values = [];
		this.nextActivity = "";
	}
	addValue(value) {
		this.values.push(value);
	}
}

function memory() {
	return new Memory();
}

const configureNewMemoryBehavior = () => {
	let vinterBtnCreateMemory = document.getElementById(
		"vinter-btn-create-memory"
	);
	vinterBtnCreateMemory.onclick = () => {
		if (isFlowInitialized()) {
			publish("oncreatememory", {});
		} else {
			alert("Fluxo ainda não ativo!");
		}
	};
};

function init() {
	configureNewMemoryBehavior();
}

init();

function showMemoryModal() {
	changeElementDisplay("vinter-modal-edit-memory", "block");
}

function configureCloseBtn() {
	let closeBtn = document.getElementById("close-edit-memory");
	closeBtn.onclick = () => {
		changeElementDisplay("vinter-modal-edit-memory", "none");
	};
}

function createMemoryEntry() {
	$("#vinter-memory-fields").append(
		"<div><label>Nome:</label><input/><label>Valor:</label><input/></div>"
	);
}

function configureBtnAddMemoryEntry() {
	let addMemoryBtn = document.getElementById("vinter-btn-add-memory");
	addMemoryBtn.onclick = () => {
		createMemoryEntry();
	};
}

function configureBtnEditMemory(memory) {
	let editMemoryBtn = document.getElementById("vinter-btn-edit-memory");
	editMemoryBtn.onclick = () => {
		document.querySelectorAll("#vinter-memory-fields div").forEach(div => {
			let name = div.querySelectorAll("input")[0].value;
			let value = div.querySelectorAll("input")[1].value;
			memory.addValue({
				name: name,
				value: value,
				scope: "DIALOG"
			});
			changeElementDisplay("vinter-modal-edit-memory", "none");
		});
	};
}

const onEditMemory = memory => {
	showMemoryModal();
	configureCloseBtn();
	configureBtnAddMemoryEntry();
	configureBtnEditMemory(memory);
};

subscribe("oneditmemory", onEditMemory);

export { memory };
