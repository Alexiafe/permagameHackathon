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

	// Plant only if action == 'PLANT'
	/**
	 * @param {string} plantName
	 * @param {ActionEnum} action
	 * @returns Roi
	 */
	getPlantRoi(action, plantName = null) {
		var otherParticipationCount = 0
		var myParticipationCount = 1
		for (const user in this.parcelHistory.playerInteraction) {
			const number = this.parcelHistory.playerInteraction[user]
			if (user === "lowi") {
				myParticipationCount += number
			} else {
				otherParticipationCount += number
			}
		}

		var myPart = 0
		if (myParticipationCount + otherParticipationCount > 0) {
			myPart = myParticipationCount / (myParticipationCount + otherParticipationCount)
		}

		var totalExpenses = this.parcelHistory.totalExpenses
		if (action === ActionEnum.FERTILIZE) totalExpenses += 5

		var plantPoints = 0
		if (action === ActionEnum.PLANT && plantName) {
			if (this.soilQualityPercentage <= 1) return -1
			totalExpenses += this.getFertilizationCountBeforeReady(plantName) * 5
			plantPoints = this.getPlantProperties(plantName).points
		} else {
			plantPoints = this.getPlantProperties().points
		}

		return plantPoints - totalExpenses * myPart
	}

	getPlantProperties(plantName) {
		var plantNameToSearch = ""
		if (plantName) {
			plantNameToSearch = plantName
		} else {
			plantNameToSearch = this.plant.plantType
		}
		return PLANTS.find((o) => o.plantName === plantNameToSearch)
	}

	getTurnsBeforeReady(plantName = null) {
		if (plantName) return this.getPlantProperties(plantName).turnToBeReady
		return this.getPlantProperties().turnToBeReady - this.plant.age
	}

	// TODO add with neighbours penality
	// Is it percent ?
	getNutrientNeededPerTurn(plantName = null) {
		var neighbours = 0
		if (plantName) neighbours = this.getNeighbours(plantName)
		else neighbours = this.getNeighbours()

		var sameFamily = 0
		if (plantName) sameFamily = neighbours.filter((el) => el == plantName.plantFamily).length
		else sameFamily = neighbours.filter((el) => el == this.plant.plantFamily).length

		var pourcentageFamilyPenalities = 1 + 0.4 * sameFamily

		if (plantName)
			return (parseFloat(this.getPlantProperties(plantName).nutrientNeed) / 100.0) * pourcentageFamilyPenalities
		return (parseFloat(this.getPlantProperties().nutrientNeed) / 100.0) * pourcentageFamilyPenalities
	}

	getFertilizationCountBeforeReady(plantName = null) {
		var nutrimentToAdd =
			this.soilQualityPercentage - this.getNutrientNeededPerTurn(plantName) * this.getTurnsBeforeReady(plantName)
		if (nutrimentToAdd < 0) return abs(nutrimentToAdd) / 50
		return 0
	}

	getNeighbours(plantName = null) {
		const size = 1

		var leftColumn = parseInt(this.column) - size
		if (leftColumn < 0) leftColumn = 0
		var rightColumn = parseInt(this.column) + size
		if (rightColumn >= this.garden.length) rightColumn = 9
		var topLine = parseInt(this.line) - size
		if (topLine < 0) topLine = 0
		var bottomLine = parseInt(this.line) + size
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
		var plantList = []
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
