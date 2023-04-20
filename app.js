const express = require("express");
const app = express();
let db = null;
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const sqlite3 = require("sqlite3");
app.use(express.json());

const InitializeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("SERVER IS RUNNING");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
    process.exit(1);
  }
};
InitializeDB();

//Get
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT
    *
    FROM
    player_details
    ORDER BY
     player_id;`;
  const getAllPlayers = await db.all(getAllPlayersQuery);
  response.send(
    getAllPlayers.map((eachPlayer) => ({
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
    }))
  );
});

//GET PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
    *
    FROM
    player_details
    WHERE
    player_id = ${playerId};`;
  const getPlayer = await db.get(getPlayerQuery);
  response.send({
    playerId: getPlayer.player_id,
    playerName: getPlayer.player_name,
  });
});

//PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerNamequery = `
  UPDATE
  player_details
  SET
  player_name = '${playerName}';`;
  const updatePlayerName = await db.run(updatePlayerNamequery);
  response.send("Player Details Updated");
});

//GET matchDetails

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT
    *
    FROM
    match_details
    WHERE
    match_id = ${matchId}`;
  const getMatchDetails = await db.get(getMatchDetailsQuery);
  response.send({
    matchId: getMatchDetails.match_id,
    match: getMatchDetails.match,
    year: getMatchDetails.year,
  });
});

//getListMatchesOfPlayer

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const matchesOfPlayerQuery = `
    SELECT
     match_details.match_id,
     match_details.match,
     match_details.year
    FROM
    match_details INNER JOIN player_match_score ON 
    match_details.match_id = player_match_score.match_id
    WHERE
    player_id = ${playerId}`;
  const matchesOfPlayer = await db.all(matchesOfPlayerQuery);
  response.send(
    matchesOfPlayer.map((eachMatchPlayer) => ({
      matchId: eachMatchPlayer.match_id,
      match: eachMatchPlayer.match,
      year: eachMatchPlayer.year,
    }))
  );
});

//listOfPlayersOfMatch API6

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const listOfPlayerOfMatchQuery = `
      SELECT
      player_details.player_id,
      player_details.player_name
      FROM
      player_details INNER JOIN player_match_score ON 
      player_details.player_id = player_match_score.player_id
      WHERE
      player_match_score.match_id = ${matchId};`;
  const listOfPlayerOfMatch = await db.all(listOfPlayerOfMatchQuery);
  response.send(
    listOfPlayerOfMatch.map((eachDetails) => ({
      playerId: eachDetails.player_id,
      playerName: eachDetails.player_name,
    }))
  );
});

//getStatistics

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const statisticsPlayerQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM
    player_Details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE
    player_details.player_id = ${playerId};`;
  const statisticsPlayer = await db.get(statisticsPlayerQuery);
  response.send(statisticsPlayer);
});

module.exports = app;
