const Parcel = require("./parcel").Parcel
const Action = require("./action").Action

const { ActionEnum, GrowthEnum } = require("./enum")

class PermaGameLogic {
	constructor(garden) {
		this.garden = garden
	}

	getActionList() {
		var actionList = []
		// actionList.push(this.getBestAction(new Parcel(0, 4, this.garden)))
		for (const line in this.garden) {
			for (const column in this.garden[line]) {
				let parcel = new Parcel(line, column, this.garden)
				actionList.push(this.getBestAction(parcel))
			}
		}
		return actionList.sort((a, b) => (a.score < b.score ? 1 : -1))
	}

	getBestAction(parcel) {
		var actionArray = [this.getFertilizeAction(parcel), this.getPlantAction(parcel), this.getHarvestAction(parcel)]
		return actionArray.reduce((obj1, obj2) => (obj1.score > obj2.score ? obj1 : obj2))
	}


	// If ROI high and soil quality < 10, increase a lot score to fertilize
	// WHat to do : harvest or fertilize ?
	/**
	 *
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getFertilizeAction(parcel) {
		var SOIL_QUALITY_THRESHOLD = 30
		var FERTILIZATION_IMPORTANCE = 1

		var score = 0
		if (parcel.isPlantExist() && parcel.isPlantGrowing()) {
			if (parcel.getNutrientNeededPerTurn() > 0 && parcel.soilQualityPercentage < SOIL_QUALITY_THRESHOLD) {
				score =
					(parcel.getPlantRoi(ActionEnum.FERTILIZE) - (parcel.getNutrientNeededPerTurn() - 1) * 5) *
					FERTILIZATION_IMPORTANCE
			} else {
				score = -10
			}
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
		var PLANT_IMPORTANCE = 1

		var bestPlant = "WHEAT"
		var score = -1 // if plant exist

		if (!parcel.isPlantExist()) {
			let result = parcel.getBestPlant()
			bestPlant = result.plantName
			score = result.score * PLANT_IMPORTANCE
		}

		return { actionName: ActionEnum.PLANT, line: parcel.line, column: parcel.column, score: score, plant: bestPlant }
	}

	/**
	 * faire une aciton altruiste avant de recolter une plante ???
	 * @param {Parcel} parcel
	 * @returns {Action}
	 */
	getHarvestAction(parcel) {
		var SOIL_QUALITY_IMPORTANCE = 0.08 // soilQuality * var
		var HARVEST_READY_PLANT_IMPORTANCE = 1.8 // roi(harvest) * var

		var score = -1 // if plant no plant or plant not ready

		if (parcel.isPlantDead()) {
			score = parcel.soilQualityPercentage * SOIL_QUALITY_IMPORTANCE
		}

		if (parcel.isPlantExist() && parcel.isPlantReady()) {
			score = parcel.getPlantRoi(ActionEnum.HARVEST) * HARVEST_READY_PLANT_IMPORTANCE
		}
		return { actionName: ActionEnum.HARVEST, line: parcel.line, column: parcel.column, score: score }
	}
}

module.exports = {
	PermaGameLogic,
}
