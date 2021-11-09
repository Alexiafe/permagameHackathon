const Parcel = require("./parcel").Parcel
const Action = require("./action").Action

const { ActionEnum } = require("./enum")

class PermaGameLogic {
	constructor(state) {
		this.garden = state.garden
		this.actions = state.actions
		this.players = state.players
		this.globalScore = state.globalScore
	}

	// Create action list sorted by score and return the first action
	getAction() {
		let actionList = []
		for (const line in this.garden) {
			for (const column in this.garden[line]) {
				let parcel = new Parcel(line, column, this.garden)
				actionList.push(this.getParcelAction(parcel))
			}
		}
		actionList = actionList.sort((a, b) => (a.score < b.score ? 1 : -1))
		console.log(actionList[0])
		return actionList[0]
	}

	getAntiAction(currentWinner) {
		let actionList = []
		for (const line in this.garden) {
			for (const column in this.garden[line]) {
				let parcel = new Parcel(line, column, this.garden)
				actionList.push(this.getFertilizeActionAgainstWinner(parcel, currentWinner))
			}
		}
		actionList = actionList.sort((a, b) => (a.score < b.score ? 1 : -1))
		console.log(actionList[0])
		return actionList[0]
	}

	getParcelAction(parcel) {
		let actionArray = [this.getFertilizeAction(parcel), this.getPlantAction(parcel), this.getHarvestAction(parcel)]
		return actionArray.reduce((obj1, obj2) => (obj1.score > obj2.score ? obj1 : obj2))
	}

	// If ROI high and soil quality < 10, increase a lot score to fertilize
	// WHat to do : harvest or fertilize ?
	// Do not fertilize a plant that will die the next turn
	// If I'm the only one to contribute, then fertilize something else
	/**
	 *
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getFertilizeAction(parcel) {
		let SOIL_QUALITY_THRESHOLD = 50
		let FERTILIZATION_IMPORTANCE = 2.5

		let score = 0

		if (parcel.isPlantGrowing()) {
			// if plant needs fertilization
			if (parcel.getFertilizationCountBeforeReady() > 0 && parcel.soilQualityPercentage < SOIL_QUALITY_THRESHOLD) {
				score = parcel.getPlantRoi(ActionEnum.FERTILIZE) * FERTILIZATION_IMPORTANCE
			} else {
				score = -10
			}
		}

		// Prevent: Fertilize before plant, but check if it's worth it to fertilize...
		if (!parcel.isPlantExist() && parcel.getPlantRoi(ActionEnum.FERTILIZE, "CORN") > 0) {
			score = 3
		}
		return {
			actionName: ActionEnum.FERTILIZE,
			line: parcel.line,
			column: parcel.column,
			score,
		}
	}

	getFertilizeActionAgainstWinner(parcel, currentWinner) {
		return {
			actionName: ActionEnum.FERTILIZE,
			line: parcel.line,
			column: parcel.column,
			score: parcel.getWinnerRoi(currentWinner),
		}
	}

	/**
	 *
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getPlantAction(parcel) {
		let PLANT_IMPORTANCE = 1 // roi * var
		let SOIL_QUALITY_THRESHOLD_TO_PLANT = 20 // Don't plant if soil quality < var

		let score = 0
		let plantName = "WHEAT"

		if (!parcel.isPlantExist() && parcel.soilQualityPercentage > SOIL_QUALITY_THRESHOLD_TO_PLANT) {
			let result = parcel.getBestPlant()
			plantName = result.plantName
			score = result.score * PLANT_IMPORTANCE
		} else {
			score = -10 // Prevent: Don't plant it the plant will die... Fertilize first
		}

		if (parcel.isPlantExist()) score = -1000

		return { actionName: ActionEnum.PLANT, line: parcel.line, column: parcel.column, score: score, plant: plantName }
	}

	/**
	 * faire une aciton altruiste avant de recolter une plante ???
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getHarvestAction(parcel) {
		let SOIL_QUALITY_IMPORTANCE = 0.08 // soilQuality * var (beyongs dead plant, which one should I harvest?)
		let HARVEST_IMPORTANCE = 10 // roi * var

		let score = 0

		// No plant or plant not ready
		if (!parcel.isPlantExist || !parcel.isPlantReady()) score = -1000

		// Plant dead, score regarding soil quality
		if (parcel.isPlantDead()) score = parcel.soilQualityPercentage * SOIL_QUALITY_IMPORTANCE

		// Plant ready and ROI > 0, harvest !
		if (parcel.isPlantReady()) {
			score = parcel.getPlantRoi(ActionEnum.HARVEST) * HARVEST_IMPORTANCE
		}

		return { actionName: ActionEnum.HARVEST, line: parcel.line, column: parcel.column, score: score }
	}

	getCurrentWinners() {
		return this.players
			.sort((a, b) => (a.score < b.score && 1) || -1)
			.map((player) => player.name)
			.filter((name) => name != "lowi")
	}
}

module.exports = {
	PermaGameLogic,
}
