const Library = require("./Library")
const PermaGameLogic = require("./permaGameLogic").PermaGameLogic
const { ActionEnum, GrowthEnum } = require("./enum")

var turnCount = 0

async function playTurn() {
	const state = await Library.fetchGameState()
	const garden = state.garden

	const permagame = new PermaGameLogic(garden)

	setLouisToken()
	var actionList = permagame.getActionList()
	executeActionList(actionList)

	// const plants = await Library.fetchPlants()

	// console.log(JSON.stringify(plants))

	// const line = Math.floor(Math.random() * gardenDimension);
	// const column = Math.floor(Math.random() * gardenDimension);
	// const plantType = "CARROT";

	// await Library.plant(line, column, plantType);
	// console.log("plant", plantType, "in", column, line);

	// setGregToken()
	// const fertilize = await Library.fertilize(0, 2)

	// setLouisToken()
	// const fertilize = await Library.fertilize(0, 0)
	// const plant = await Library.plant(0, 0, "CORN")
	// const harvest = await Library.harvest(0, 0)

	// const fertilize = await Library.fertilize(0, 0)

	// console.log(JSON.stringify(garden[0][0]))
}

async function cycle(timeout) {
	console.log(`--- TURN ${turnCount} ---`)
	turnCount++
	playTurn()
		.catch((error) => console.error("error", error))
		.finally(() => {
			setTimeout(() => {
				cycle(timeout)
			}, timeout)
		})
}

function start() {
	console.log("STARTING BOT!")
	cycle(800)
}

start()

function executeActionList(actionList, maxAction = 1) {
	var actionCount = 0

  console.log(actionList[0])
  console.log(actionList[1])
  console.log(actionList[2])
	for (const key in actionList) {
		if (actionCount >= maxAction) break

		let action = actionList[key]

		switch (action.actionName) {
			case ActionEnum.FERTILIZE:
				Library.fertilize(action.line, action.column)
				break

			case ActionEnum.PLANT:
				Library.plant(action.line, action.column, action.plant)
				break

			case ActionEnum.HARVEST:
				Library.harvest(action.line, action.column)
				break

			default:
				console.error("No action")
				break
		}

		actionCount++
	}
}

function setLouisToken() {
	Library.setToken(
		"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEUEhvVWswek5KdnBqRFFWdjVSa3hkbDVRVU16TWc3RDQwUUFaanBMak1BIn0.eyJleHAiOjE2MzczNzc1MzMsImlhdCI6MTYzNjA4MTUzNCwiYXV0aF90aW1lIjoxNjM1NTIyNjQ1LCJqdGkiOiI1MjIyMTAxYS0yNGUxLTRlNzktODBmOS1mODFmZWRkZjAwYzgiLCJpc3MiOiJodHRwczovL3Blcm1hZ2FtZS5hcHAubm9yc3lzLmlvL2F1dGgvcmVhbG1zL3Blcm1hZ2FtZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIxZTI5MzEwMy1kNjZjLTQwODItODc4MC02NGNjZTYyMjkyMzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJsb2dpbi1hcHAiLCJub25jZSI6IjZkMzgwZjlkLTRiZjgtNGZhOS05OTgwLTlkZjc5ZmIzNTE0MiIsInNlc3Npb25fc3RhdGUiOiIxMGY1YjE4Ny1kZTc4LTRmODAtYWMzMS02YWI1ZmE5YzBjMTAiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcGVybWFnYW1lIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInBsYXllciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6Imxvd2kiLCJlbWFpbCI6Imx1aWdpMjEudGhvbWFzQGdtYWlsLmNvbSIsImdyb3VwIjoiUE9JVlJPTiJ9.CJJ4wAHnOPodRIaZfJarPKvFHcljcFGYrHBPVe-7TKOA49k71sSGmzM2LzYJLvMObogtjQOpPkx2HfDtmfzibYZqADTIAJpWtwnb1r9a0lPVSP3EKQrwcIEaATM2QF6I1AG0esL6WhLAW88qIN1yoPNAo9n_oPO5_H_shWLOH-H6qE3FZhULC6p450kcTW_5lNyiaFU1bDbzrparjma___vWGoEEqEW0EAoZqIlEtEix7gmtxVjwVihatCgMXur0dgWESYIB-cf3Q8yI7JlErlMxSmEK1uLiWBpMkizv9_dEff5sbJmq7Hciwty5Wt4E2QbFpwk80xDRF6lk7aTCgQ"
	)
}

function setGregToken() {
	Library.setToken(
		"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEUEhvVWswek5KdnBqRFFWdjVSa3hkbDVRVU16TWc3RDQwUUFaanBMak1BIn0.eyJleHAiOjE2MzczODYyOTUsImlhdCI6MTYzNjA5MDI5NywiYXV0aF90aW1lIjoxNjM2MDkwMjk1LCJqdGkiOiIzZWEwMDE5ZS0yMjdkLTRkNDItYTUxMi1iODU5ZmZmODY1YTMiLCJpc3MiOiJodHRwczovL3Blcm1hZ2FtZS5hcHAubm9yc3lzLmlvL2F1dGgvcmVhbG1zL3Blcm1hZ2FtZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIzODhiODc1OC1iYTM5LTQwMGMtYTVhZS03OTgwNWE5YjhhYTAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJsb2dpbi1hcHAiLCJub25jZSI6IjQwMGJiMDRlLTRhYWEtNGM1Zi04ZGE1LTI4NzRmYjM0MTg2OCIsInNlc3Npb25fc3RhdGUiOiIxOTdlYzE5NC1mZmE1LTQzMzUtODEwMC1mMWNmOTU1ODNlMzAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcGVybWFnYW1lIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInBsYXllciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWdsYW1hIiwiZW1haWwiOiJncmVnYWxiaXp6QGdtYWlsLmNvbSIsImdyb3VwIjoiUE9JVlJPTiJ9.CNlFSL4OFmZybP4Q0sL6k4WvnqaaD4tsvESX2ZHX3mIaYVjJdCjn37UyyUZj9zA25L7-4PoGFDj2xKmtWvnaDC3uM65Dl5u_2ocGvKPKwJ2t4Y1y18xUUXOt0FKedD-LofbItJZWE6rUBlxOQkszF8W1x7jMZTLMRpWhpF1Krmfs-xu20yfTdhrVVzIavmoB_z7glzGi_cqoK2Frch02L0qR-xNuCJZN1BlVNw1Onpx23BpLURnsV3f2DZyoDVeytLQjVAo1-lowlXa6vRYclAAMvAVNsDRlYfOoj0Llzg_OSLWXCCzNJNJWmkQUimZQVirYzvTbC9T0iYeO7juFnw"
	)
}