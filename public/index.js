// index.js
document.addEventListener("DOMContentLoaded", () => {
	const usernameInput = document.getElementById("username");
	const roomIdInput = document.getElementById("roomId");
	const startMeetingButton = document.getElementById("startMeeting");
	const joinMeetingButton = document.getElementById("joinMeeting");

	if (startMeetingButton && joinMeetingButton) {
		startMeetingButton.addEventListener("click", () => {
			const username = usernameInput.value.trim();
			if (username) {
				localStorage.setItem("username", username);
				const roomId = generateUniqueRoomId();
				navigateToMeeting(roomId);
			} else {
				alert("Please enter your name.");
			}
		});

		joinMeetingButton.addEventListener("click", () => {
			const username = usernameInput.value.trim();
			const roomId = roomIdInput.value.trim();
			if (username) {
				localStorage.setItem("username", username);
				if (roomId) {
					navigateToMeeting(roomId);
				} else {
					alert("Please enter a room ID to join.");
				}
			} else {
				alert("Please enter your name.");
			}
		});
	} else {
		console.error("Required elements are missing from the page.");
	}

	function navigateToMeeting(roomId) {
		window.location.href = `/room?roomId=${roomId}`;
	}

	function generateUniqueRoomId() {
		// Simple UUID generator for demonstration purposes
		return "xxxxxx".replace(/[x]/g, () =>
			Math.floor(Math.random() * 16).toString(16)
		);
	}
});
