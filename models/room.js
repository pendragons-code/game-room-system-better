const rooms = require("../loaders/socketEvents.js");
const { maxExistenceDurationHours } = require("../config/config.json");

class Room {
	constructor(creatorID, roomID) {
		let currentTime = new Date();
		let endCreationTime = new Date(currentTime.getTime());
		endCreationTime.setHours(currentTime.getHours() + maxExistenceDurationHours);
		let friendlyEndTime = currentDateTime("convert", endCreationTime);

		// defining the room
		this.roomID = roomID,
		this.creator = creatorID,
		this.gameState = "waiting",
		this.players = new Map(),
		this.createdTime = "",
		this.totalPlayerCount = 1, // note that this is used to keep track of playerNumbers and names, this number does not change if a player leaves.
		this.createdTime = currentTime,
		this.expiryTime = friendlyEndTime,
		this.startGameTime = "",
		this.playersThatLost = [],
		this.winner = "";

		this.players.set(creatorID, "player1");
	}

	// info transfer
	broadcast(eventName, details) {
		if(details) return io.to(this.roomID).emit(eventName, details);
		return io.to(this.roomID).emit(eventName);
	}

	sendToPlayer(playerID, eventName, details) {
		if(!details) return io.to(playerID).emit(eventName);
		return io.to(`${playerID}`).emit(eventName, details);
	}

	// generic player manipulation
	onlinePlayerSize() {
		return this.players.size();
	}

	// translates the playerID to the playerNumber
	idToIndex(playerID) {
		return this.players.get(playerID);
	}
	// gives an array of all online players, this is useful at the start of matches and more
	currentOnlinePlayers() {
		let currentPlayerNumberOnline = [];
		for(const playerNumber of this.players.values()) {
			currentPlayerNumberOnline.push(playerNumber);
		}
		this.broadcast("currentOnlineUsers", { currentPlayerNumberOnline: currentPlayerNumberOnline });
	}

	// tells user what their player number is - we might not actually need this ngl
	giveWhoAmIToAll() {
		for(const [playerID, playerNumber] of this.players) {
			this.sendToPlayer(playerID, "whoAmI", { playerNumber: playerNumber });
		}
	}

	addPlayer(playerID) {
		this.totalPlayerCount += 1;
		this.players.set(playerID, `player${this.totalPlayerCount}`);
		// I know that technicall we can just send the total playercount and let the frontend javascript figure it out, but during testing i got very inconsistent behaviour and I am at the verge of murdering myself
		let playerNumberOfNewUser = this.idToIndex(playerID);
		this.sendToPlayer("whoAmI", { playerNumber: playerNumberOfNewUser });
		this.broadcast("newPlayerJoined", { playerNumber: playerNumberOfNewUser });
	}

	removePlayer(playerID) {
		this.players.delete(playerID);
		this.broadcast("playerLeftRoom", { playerNumber: this.idToIndex(playerID) });
		this.currentOnlinePlayers();
		if(this.players.size() < 2 && this.gameState === "running") {
			this.broadcast("redirect", "This room has too little players and has closed, redirecting.");
			console.log(`closed ${this.roomID}`);
			delete rooms[this.roomID];
		}
	}

	startGame() {
		// this function does not actually start any game because there is no pre-defined game loop
		this.giveWhoAmIToAll(); // technically they already know, but just to ensure that no wonky laggy behaviour
		this.broadcast("gameStart", { gameRunTime: this.gameRunTime });
		this.gameState = "running";
	}

	endGame() {
		this.broadcast(`gameEnd`, { winner: this.winner });
		delete rooms[this.roomID];
		console.log(`closed ${this.roomID}`);
	}

}

module.exports = Room;
// Before I begin I wanna say, I have honestly no idea how I want to make this data structure.