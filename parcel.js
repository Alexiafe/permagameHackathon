const { ActionEnum, GrowthEnum } = require("./enum")
const PLANTS = require("./plants.json")

class Parcel {
	constructor(line, column, garden) {
		this.line = line
		this.column = column
		this.garden = garden

		this.parcel = this.garden[line][column]
		this.plant = this.parcel.plant
		this.parcelHistory = this.parcel.parcelHistory
		this.soilQualityPercentage = this.parcel.soilQualityPercentage
	}

	getPlantFamily() {
		return this.plant.plantFamily
	}

	isPlantExist() {
		return this.plant ? true : false
	}

	isPlantGrowing() {
		if (!this.plant) return false
		return this.plant.growth === GrowthEnum.GROWING
	}

	isPlantReady() {
		if (!this.plant) return false
		return this.plant.growth === GrowthEnum.READY
	}

	isPlantDead() {
		if (!this.plant) return false
		return this.plant.growth === GrowthEnum.DEAD
	}

	/**
	 * @param {string} plantName Simulate a plant
	 * @param {ActionEnum} action if action is applied
	 * @returns Roi
	 */
	getPlantRoi(action = null, plantName = null) {
		// Get contribution which is the percentage of score I'm gonna collect
		let myContribution = 0
		let otherParticipationCount = 0
		let myParticipationCount = 0
		if (action !== null) myParticipationCount += 1
		for (const user in this.parcelHistory.playerInteraction) {
			const number = this.parcelHistory.playerInteraction[user]
			if (user === "lowi") {
				myParticipationCount += number
			} else {
				otherParticipationCount += number
			}
		}
		if (myParticipationCount + otherParticipationCount > 0) {
			myContribution = myParticipationCount / (myParticipationCount + otherParticipationCount)
		}

		// Get total expenses
		let totalExpenses = this.parcelHistory.totalExpenses
		if (plantName || this.isPlantExist()) totalExpenses += this.getFertilizationCountBeforeReady(plantName) * 5

		// Get plant points
		let plantPoints = 0
		if (plantName || (this.isPlantExist() && !this.isPlantDead())) {
			plantPoints = this.getPlantProperties(plantName).points
		}

		return (plantPoints - totalExpenses) * myContribution
	}

	getPlantProperties(plantName = null) {
		if (!plantName) plantName = this.plant.plantType
		return PLANTS.find((o) => o.plantName === plantName)
	}

	getTurnsBeforeReady(plantName = null) {
		if (plantName) return this.getPlantProperties(plantName).turnToBeReady
		return this.getPlantProperties().turnToBeReady - this.plant.age
	}

	getNutrimentNeededPerTurn(plantName = null) {
		let neighboursList = this.getNeighbours()
		let plantFamily = ""
		if (plantName) {
			plantFamily = this.getPlantProperties(plantName).plantFamily
		} else {
			plantFamily = this.plant.plantFamily
		}
		let sameFamilyCount = neighboursList.filter((el) => el == plantFamily).length
		let percentageFamilyPenalities = 1 + 0.4 * sameFamilyCount

		return parseFloat(this.getPlantProperties(plantName).nutrientNeed) * percentageFamilyPenalities
	}

	getFertilizationCountBeforeReady(plantName = null) {
		let nutrimentToAdd =
			this.soilQualityPercentage - this.getNutrimentNeededPerTurn(plantName) * this.getTurnsBeforeReady(plantName)
		if (nutrimentToAdd < 0) return Math.abs(nutrimentToAdd) / 50
		return 0
	}

	getNeighbours() {
		const size = 1

		let leftColumn = parseInt(this.column) - size
		if (leftColumn < 0) leftColumn = 0
		let rightColumn = parseInt(this.column) + size
		if (rightColumn >= this.garden.length) rightColumn = 9
		let topLine = parseInt(this.line) - size
		if (topLine < 0) topLine = 0
		let bottomLine = parseInt(this.line) + size
		if (bottomLine >= this.garden[0].length) bottomLine = 9

		const familyNeighbours = []
		for (let line = topLine; line <= bottomLine; line++) {
			for (let column = leftColumn; column <= rightColumn; column++) {
				const parcel = new Parcel(line, column, this.garden)
				if (parcel.isPlantExist() && !parcel.isPlantDead()) {
					familyNeighbours.push(parcel.getPlantFamily())
				}
			}
		}
		return familyNeighbours
	}

	/**
	 *
	 * @returns {string}
	 */
	getBestPlant() {
		let plantList = []
		for (const key in PLANTS) {
			plantList.push({
				plantName: PLANTS[key].plantName,
				score: this.getPlantRoi(ActionEnum.PLANT, PLANTS[key].plantName),
			})
		}
		return plantList.reduce((obj1, obj2) => (obj1.score > obj2.score ? obj1 : obj2))
	}
}

module.exports = {
	Parcel,
}

// get plant roi
// if action === PLANT => prendre en consideration le soil
