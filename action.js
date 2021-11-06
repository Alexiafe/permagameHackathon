const ActionEnum = require("./permaGameLogic").ActionEnum

class Action {
	constructor() {
    this.action = ActionEnum.PLANT
		this.line = 0
    this.column = 0
    this.score = 0
    this.plant = ""
	}
}

module.exports = {
	Action,
}