
document.addEventListener("DOMContentLoaded", () => {
	const socket = io();
	const roomIDValueInput = document.getElementById("roomIDValue");
	const joinRoomBtn = document.getElementById("joinRoomBtn");
	const createRoomBtn = document.getElementById("createRoomBtn");
	const roomIDDiv = document.getElementById("roomID");
	const messageDiv = document.getElementById("message");
	const introDiv = document.getElementById("intro");
	const hiddenDivsRoom = document.getElementById("hiddenRoomDetails");

	socket.on("roomID", (roomIDfromSocket) => {
		roomIDDiv.textContent = `${roomIDfromSocket}`;
	});


	function newMessage(input) {
		if(!input) return messageDiv.textContent = "";
		messageDiv.textContent = `${input}`;
	}

	createRoomBtn.addEventListener("click", () => {
		joinRoomBtn.remove();
		socket.emit("createRoom");
		socket.on("createSuccess", () => {
			hiddenDivsRoom.style.display = "block";
			createRoomBtn.remove();
			const startGameBtn = document.createElement('button');
			startGameBtn.textContent = 'Start Game!';
			startGameBtn.id = "startGameButton";
			introDiv.parentNode.appendChild(startGameBtn);
			roomIDValueInput.parentNode.removeChild(roomIDValueInput); // this sounds stupid but this was the only thing that worked
		});
	});

	// join
	joinRoomBtn.addEventListener("click", () => {
		if (roomIDValueInput.value !== "") {
			hiddenDivsRoom.style.display = "block";
			joinRoomBtn.disabled = true;
			roomIDDiv.textContent = roomIDValueInput.value.trim();
			socket.emit("joinRoom", roomIDValueInput.value.trim());
			socket.on("joinRoomAcknowledgement", () => {
				joinRoomBtn.remove();
				roomIDValueInput.parentNode.removeChild(roomIDValueInput); // this sounds stupid but this was the only thing that worked
				socket.on("roomDoesNotExist", () => {
					alert("This room does not exist!");
					return window.location.href = "/";
				});
				createRoomBtn.remove();
				roomIDValueInput.remove();
				const waitingH1 = document.createElement('h1');
				waitingH1.innerHTML = "Waiting for game to start!";
				introDiv.textContent = "";
				introDiv.appendChild(waitingH1);
			});
		}
	});

	// socketEvents
	socket.on("disconnect", () => {
		newMessage("Lost connection to server!");
		return window.location.href = "/";
	});

	socket.on("redirect", () => {
		return window.location.href = "/";
	});

	socket.on("alert", (content) => {
		alert(content);
	});

	socket.on("notEnoughPlayersToStart", () => {
		newMessage("There are not enough players to start the game!")
		startGameButton.disabled = false;
	});

	socket.on("redirect", (content) => {
		alertModal(content);
		setTimeout(() => {
			return window.location.href = "/";
		}, 1500);
	});

	socket.on("message", (content) => {
		newMessage(content);
	});

});