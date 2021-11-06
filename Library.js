const https = require("https");

const HOST = "permagame.app.norsys.io";
const PORT = 443;
const SETTINGS_PATH = "/api/advancedInfos";
const ACTION_PATH = "/api/action";
const ACTION_LIST_PATH = "/api/actionList";
const STATE_PATH = "/api/state";
const PLANTS_PATH = "/api/plants";
const FAMILIES_PATH = "/api/plantFamilies";
var TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEUEhvVWswek5KdnBqRFFWdjVSa3hkbDVRVU16TWc3RDQwUUFaanBMak1BIn0.eyJleHAiOjE2MzczNzc1MzMsImlhdCI6MTYzNjA4MTUzNCwiYXV0aF90aW1lIjoxNjM1NTIyNjQ1LCJqdGkiOiI1MjIyMTAxYS0yNGUxLTRlNzktODBmOS1mODFmZWRkZjAwYzgiLCJpc3MiOiJodHRwczovL3Blcm1hZ2FtZS5hcHAubm9yc3lzLmlvL2F1dGgvcmVhbG1zL3Blcm1hZ2FtZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIxZTI5MzEwMy1kNjZjLTQwODItODc4MC02NGNjZTYyMjkyMzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJsb2dpbi1hcHAiLCJub25jZSI6IjZkMzgwZjlkLTRiZjgtNGZhOS05OTgwLTlkZjc5ZmIzNTE0MiIsInNlc3Npb25fc3RhdGUiOiIxMGY1YjE4Ny1kZTc4LTRmODAtYWMzMS02YWI1ZmE5YzBjMTAiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcGVybWFnYW1lIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInBsYXllciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6Imxvd2kiLCJlbWFpbCI6Imx1aWdpMjEudGhvbWFzQGdtYWlsLmNvbSIsImdyb3VwIjoiUE9JVlJPTiJ9.CJJ4wAHnOPodRIaZfJarPKvFHcljcFGYrHBPVe-7TKOA49k71sSGmzM2LzYJLvMObogtjQOpPkx2HfDtmfzibYZqADTIAJpWtwnb1r9a0lPVSP3EKQrwcIEaATM2QF6I1AG0esL6WhLAW88qIN1yoPNAo9n_oPO5_H_shWLOH-H6qE3FZhULC6p450kcTW_5lNyiaFU1bDbzrparjma___vWGoEEqEW0EAoZqIlEtEix7gmtxVjwVihatCgMXur0dgWESYIB-cf3Q8yI7JlErlMxSmEK1uLiWBpMkizv9_dEff5sbJmq7Hciwty5Wt4E2QbFpwk80xDRF6lk7aTCgQ";

function setToken(newToken) {
  TOKEN = newToken
}

function requestFetch(path) {
  return new Promise((resolve, reject) => {
    let data = "";
    const req = https.request(
      {
        host: HOST,
        port: PORT,
        path: path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      },
      (res) => {
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", (error) => reject(error));
      }
    );
    req.on("error", (error) => reject(error));
    req.end();
  });
}

function requestPost(path, data) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: HOST,
      port: PORT,
      path: path,
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    });
    req.on("error", (error) => reject(error));
    req.on("close", () => resolve());
    req.write(data);
    req.end();
  });
}

function fetchGameSettings() {
  return requestFetch(SETTINGS_PATH);
}

function fetchGameState() {
  return requestFetch(STATE_PATH);
}

function fetchActionList() {
  return requestFetch(ACTION_LIST_PATH);
}

function fetchPlants() {
  return requestFetch(PLANTS_PATH);
}

function fetchFamilies() {
  return requestFetch(FAMILIES_PATH);
}

function doAction(action) {
  const stringAction = JSON.stringify(action);
  return requestPost(ACTION_PATH, stringAction);
}

function plant(line, column, plantType) {
  return doAction({
    action: "plant",
    column,
    line,
    plantType,
  });
}

function harvest(line, column) {
  return doAction({
    action: "harvest",
    column,
    line,
  });
}

function fertilize(line, column) {
  return doAction({
    action: "fertilize",
    column,
    line,
  });
}

module.exports = {
  fetchGameSettings,
  fetchGameState,
  fetchActionList,
  fetchPlants,
  fetchFamilies,
  plant,
  harvest,
  fertilize,
  setToken
};
