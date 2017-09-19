class Begin {
	constructor() {
		this.name = "BeginActivity";
		this.type = "Root";
		this.nextActivity = "";
	}
}

function begin() {
	return new Begin();
}

export { begin };
