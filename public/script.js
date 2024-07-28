const socket = io("/");
const myPeer = new Peer(undefined, {
	host: "/",
	port: "3001",
});

const videoGrid = document.getElementById("video-grid-container");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

const muteButton = document.getElementById("muteButton");
const videoButton = document.getElementById("videoButton");
const leaveButton = document.getElementById("leaveButton");

let myStream;

// Get user media
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myStream = stream;
		console.log("Received stream:", stream);
		addVideoStream(myVideo, stream);

		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				console.log("Received user stream:", userVideoStream);
				addVideoStream(video, userVideoStream);
			});
		});

		socket.on("user-connected", (userId) => {
			console.log("User connected:", userId);
			setTimeout(() => {
				connectToNewUser(userId, stream);
			}, 1000);
		});
	})
	.catch((error) => {
		console.error("Error accessing media devices.", error);
	});

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close();
});
myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	console.log("Appending video to grid");
	videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		console.log("Connecting to new user stream:", userVideoStream);
		addVideoStream(video, userVideoStream);
	});
	call.on("close", () => {
		video.remove();
	});
	peers[userId] = call;
}

// Handle mute button
muteButton.addEventListener("click", () => {
	if (myStream) {
		const enabled = myStream.getAudioTracks()[0].enabled;
		if (enabled) {
			myStream.getAudioTracks()[0].enabled = false;
			muteButton.innerHTML = '<i class="fa fa-microphone-slash"></i>';
			muteButton.style.background =
				"radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,100,100,1) 100%)";
		} else {
			myStream.getAudioTracks()[0].enabled = true;
			muteButton.innerHTML = '<i class="fa fa-microphone"></i>';
			muteButton.style.background =
				"linear-gradient( 45deg, rgba(63, 94, 251, 1) 0%, rgba(203, 70, 252, 1) 100% )";
		}
	} else {
		console.warn("myStream is not defined.");
	}
});

// Handle video button
videoButton.addEventListener("click", () => {
	if (myStream) {
		const enabled = myStream.getVideoTracks()[0].enabled;
		if (enabled) {
			myStream.getVideoTracks()[0].enabled = false;
			videoButton.innerHTML = '<i class="fa fa-video-slash"></i>';
			videoButton.style.background =
				"radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,100,100,1) 100%)";
		} else {
			myStream.getVideoTracks()[0].enabled = true;
			videoButton.innerHTML = '<i class="fa fa-video"></i>';
			videoButton.style.background =
				"linear-gradient( 45deg, rgba(63, 94, 251, 1) 0%, rgba(203, 70, 252, 1) 100% )";
		}
	} else {
		console.warn("myStream is not defined.");
	}
});

// Handle leave button
leaveButton.addEventListener("click", () => {
	if (myStream) {
		myStream.getTracks().forEach((track) => track.stop());
	}
	socket.disconnect();
	myPeer.destroy();
	window.location.href = "/";
});

// Controls visibility
const controls = document.querySelector(".controls");
let hideTimeout;

function showControls() {
	clearTimeout(hideTimeout);
	controls.classList.add("visible"); // Show controls
	hideTimeout = setTimeout(() => {
		controls.classList.remove("visible"); // Hide controls after 3 seconds
	}, 3000); // Adjust the timeout duration as needed
}

document.addEventListener("mousemove", showControls);
document.addEventListener("keydown", showControls); // Optional: also show controls on keydown

// Initially hide controls after a delay
hideTimeout = setTimeout(() => {
	controls.classList.remove("visible"); // Hide controls
}, 3000); // Adjust the timeout duration as needed
