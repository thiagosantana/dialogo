import { changeElementDisplay } from "./app.js";
import { subscribe, publish } from "./event.js";

function openMenu() {
	changeElementDisplay("menu-activities", "block");
	let btnClose = document.getElementById("close-menu");
	btnClose.onclick = () => {
		changeElementDisplay("menu-activities", "none");
		publish("onmenuactivityclose", {});
	};
}

export { openMenu };
