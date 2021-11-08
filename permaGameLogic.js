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
		actionList.push(this.getParcelAction(new Parcel(0, 0, this.garden)))
		actionList.push(this.getParcelAction(new Parcel(0, 1, this.garden)))
		actionList.push(this.getParcelAction(new Parcel(1, 0, this.garden)))
		actionList.push(this.getParcelAction(new Parcel(1, 1, this.garden)))
		// for (const line in this.garden) {
		// 	for (const column in this.garden[line]) {
		// 		let parcel = new Parcel(line, column, this.garden)
		// 		actionList.push(this.getParcelAction(parcel))
		// 	}
		// }
		actionList = actionList.sort((a, b) => (a.score < b.score ? 1 : -1))
		console.log(actionList[0], actionList[1], actionList[2], actionList[3])
		return actionList[0]
	}

	getParcelAction(parcel) {
		let actionArray = [this.getFertilizeAction(parcel), this.getPlantAction(parcel), this.getHarvestAction(parcel)]
		return actionArray.reduce((obj1, obj2) => (obj1.score > obj2.score ? obj1 : obj2))
	}

	// If ROI high and soil quality < 10, increase a lot score to fertilize
	// WHat to do : harvest or fertilize ?
	// Do not fertilize a plant that will die the next turn
	/**
	 *
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getFertilizeAction(parcel) {
		let SOIL_QUALITY_THRESHOLD = 50
		let FERTILIZATION_IMPORTANCE = 3

		let score = 1 // Fertilize if you cannot plant or harvest
		if (parcel.isPlantExist() && parcel.isPlantGrowing()) {
			// if plant will need fertilization
			if (parcel.getFertilizationCountBeforeReady() > 0 && parcel.soilQualityPercentage < SOIL_QUALITY_THRESHOLD) {
				score =
					(parcel.getPlantRoi(ActionEnum.FERTILIZE) - (parcel.getNutrimentNeededPerTurn() - 1) * 5) *
					FERTILIZATION_IMPORTANCE
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

	/**
	 *
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getPlantAction(parcel) {
		let PLANT_IMPORTANCE = 1
		let SOIL_QUALITY_THRESHOLD_TO_PLANT = 30

		let bestPlant = "WHEAT"
		let score = -1 // if plant exist

		if (!parcel.isPlantExist() && parcel.soilQualityPercentage > SOIL_QUALITY_THRESHOLD_TO_PLANT) {
			let result = parcel.getBestPlant()
			bestPlant = result.plantName
			score = result.score * PLANT_IMPORTANCE
		} else {
			score = 0 // Prevent: Don't plant it the plant will die... Fertilize first
		}

		return { actionName: ActionEnum.PLANT, line: parcel.line, column: parcel.column, score: score, plant: bestPlant }
	}

	/**
	 * faire une aciton altruiste avant de recolter une plante ???
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getHarvestAction(parcel) {
		let SOIL_QUALITY_IMPORTANCE = 0.08 // soilQuality * var

		let score = -1 // if no plant or plant not ready

		if (parcel.isPlantDead()) {
			score = parcel.soilQualityPercentage * SOIL_QUALITY_IMPORTANCE
			// if (score === 0) score = 2 // Prevent: if all soil are at 0 and there is a dead plant, harvest instead of fertilize
		}

		if (parcel.isPlantExist() && parcel.isPlantReady()) {
			score = (parcel.getPlantRoi(ActionEnum.HARVEST) > 0) ? 100 : 0
		}
		return { actionName: ActionEnum.HARVEST, line: parcel.line, column: parcel.column, score: score }
	}
}

module.exports = {
	PermaGameLogic,
}
