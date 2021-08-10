const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let app = express();
let databasePath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());
let dataBase = null;

app.use(express.json());

const initiateDatabase = async () => {
  try {
    dataBase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Starting at http://localhost:3000/")
    );
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
initiateDatabase();

//API 1 get players details
app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT
       player_id as playerId, player_name as playerName
    FROM
        player_details;`;
  let playersList = await dataBase.all(getPlayers);
  response.send(playersList);
});

//API 2 get a specific player using player_id
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  const getPlayer = `
    SELECT
       player_id as playerId, player_name as playerName
    FROM
        player_details
    WHERE
        player_id = ${playerId};`;
  let playerList = await dataBase.get(getPlayer);
  response.send(playerList);
});

//API 3 Update player details using player_id
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
   UPDATE  player_details
   SET
       player_name = '${playerName}'
    WHERE
        player_id = ${playerId};`;
  let update = await dataBase.run(updatePlayer);
  response.send("Player Details Updated");
});

//API 4 get match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  const getMatch = `
    SELECT
       match_id as matchId, match, year
    FROM
        match_details
    WHERE
        match_id = ${matchId};`;
  let matchResult = await dataBase.get(getMatch);
  response.send(matchResult);
});

//API 5 get list all matches of a player
app.get("/players/:playerId/matches/", async (request, response) => {
  let { playerId } = request.params;
  const getMatch = `
    SELECT
       match_details.match_id as matchId, match_details.match, match_details.year
    FROM
        match_details NATURAL JOIN player_match_score
    WHERE
        player_match_score.player_id = ${playerId};`;
  let matchResult = await dataBase.all(getMatch);
  response.send(matchResult);
});

//API 6 get list of players of a specific match

app.get("/matches/:matchId/players/", async (request, response) => {
  let { matchId } = request.params;
  const getPlayers = `
    SELECT
       player_details.player_id as playerId, player_details.player_name as playerName
    FROM
        player_details NATURAL JOIN player_match_score
    WHERE
        player_match_score.match_id = ${matchId};`;
  let playersList = await dataBase.all(getPlayers);
  response.send(playersList);
});

//API 7 get player statistics of player
app.get("/players/:playerId/playerScores/", async (request, response) => {
  let { playerId } = request.params;
  const getStatsOfPlayer = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  let playerStats = await dataBase.get(getStatsOfPlayer);
  response.send(playerStats);
});

module.exports = app;
