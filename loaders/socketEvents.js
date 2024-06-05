const { generateRoomID } = require("../utils/generateRoomID.js");
const { logError } = require("../utils/errorManager.js");
const config = require("../config/config.json");
const Room = require("../models/room.js");

const creatorsOfRooms = new Set();
const playersInRooms = new Map();

const rooms = {};
modue.exports.rooms = rooms;

io.on("connection", (socket) => {
	let currentRoom;

	// joining room
	socket.on("joinRoom", (roomID) => {
		try {
			let playerID = socket.id;
			currentRoom = rooms[roomID];
			if(!currentRoom) return socket.emit("This room does not exist.");
			if(currentRoom.gameState !== "waiting") return socket.emit("alert", "This room has already started the game!");
			if(currentRoom.playerNumber.length >= config.maxPlayersPerRoom) return socket.emit("alert", "This room has reached the max capacity");
			if(playersInRooms.has(playerID)) return socket.emit("alert", "You are already in this room!");
			socket.join(roomID);
			currentRoom.addPlayer(playerID);
			socket.emit("joinRoomAcknowledgement");
			console.log(`${playerID} joined ${currentRoom}`);
			return playersInRooms.set([playerID, roomID]);
		} catch(error) {
			logError(error, `Error in joining room!\nsocketid: ${playerID}\nroomID: ${currentRoom}`);
		}
	});

	// creating room
	socket.on("createRoom", () => {
		try {
			let creatorID = socket.id;
			if(Object.keys(rooms).length >= config.maxRooms) return socket.emit("alert", "Sorry! We are experiencing high load right now and there are too many rooms! Please try again later."); // I know that we can actually just look at the length of creatorsOfRooms, but I just wanted to make sure that we do not have any ghost rooms
			if(creatorsOfRooms.has(creatorID)) return socket.emit("alert", "You already created a room!");
			let genID = generateRoomID(creatorID.substring(0, 5));
			let newRoom = new Room(creatorID, genID);
			rooms[newRoom.roomID] = newRoom;
			creatorsOfRooms.add(creatorID);
			socket.emit("roomID", genID);
			socket.join(genID);
			console.log(`${creatorID} created ${genID}`);
			playersInRooms.set([creatorID, genID]);
			socket.emit("createSuccess"); // might consider using some .then and .catch around
		} catch(error) {
			logError(error, `Error in creating room!\ngenID: ${genID}\nsocketID: ${creatorID}`);
		}
	});

	// starting game
	socket.on("startGame", (roomID) => {
		try {
			currentRoom = rooms[roomID];
			let gameInitiator = socket.id;
			if(!currentRoom) return socket.emit("roomDoesNotExist");
			if(gameInitiator !== currentRoom.creator) return socket.emit("alert", "You are not the creator and cannot perform that action!");
			if(currentRoom.players.size() < 2) return socket.emit("notEnoughPlayersToStart");
			startGameLoop(currentRoom);
			console.log(rooms[roomID]);
			return console.log(`Game started in ${roomID}`);
		} catch(error) {
			logError(error, `Error in starting game\nsocketid: ${gameInitiator}\nroomid: ${roomID}`);
		}
	});

	// socket disconnection
	socket.on("disconnect", () => {
		try {
			let playerID = socket.id;
			if(playersInRooms.has(playerID)) {
				let roomOfPlayerID = playersInRooms.get(playerID);
				let roomOfPlayer = rooms[`${roomOfPlayerID}`];
				if(!roomOfPlayer) return;
				roomOfPlayer.removePlayer(playerID);
				socket.leave(roomOfPlayerID);
				io.to(roomOfPlayerID).emit("message", `Player ${roomOfPlayer.idToIndex(playerID)} left the room!`);
				console.log(rooms[`${roomOfplayerID}`]);
				if(creatorsOfRooms.has(playerID)){
					creatorsOfRooms.delete(playerID);
					roomOfPlayer.broadcast("redirect", "The creator has left the game, closing room!");
					delete rooms[`${roomOfPlayerID}`];
				}
			}
			playersInRooms.delete(playerID);
		} catch (error) {
			logError(error, `error disconnecting\nsocketid: ${playerID}`)
		}
	});
});

function startGameLoop(room) {
	// honestly there is no point of this being here because you can make the call directly, but i put it in a separate function for testing
	// that said, I will probably move it back in, in the future
	room.startGame();
}
