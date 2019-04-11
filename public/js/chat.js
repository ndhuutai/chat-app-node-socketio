const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

const autoscroll = () => {
	//new message element
	const $newMessage = $messages.lastElementChild;

	//Height of new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	//visible height
	const visibleHeight = $messages.offsetHeight;

	//height of messages container
	const containerHeight = $messages.scrollHeight;

	//How far have i scrolled?
	const scrollOffSet = $messages.scrollTop + visibleHeight;

	if(containerHeight - newMessageHeight <= scrollOffSet) {
		$messages.scrollTop = $messages.scrollHeight
	}
};

// socket.on('countUpdated', (count) => {
// 	console.log('The count has been updated', count);
// });
//
// document.querySelector('#increment').addEventListener('click', () => {
// 	console.log('button is clicked');
// 	socket.emit('increment');
// });

socket.on('message', (message) => {
	console.log(message);

	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll();
});

socket.on('locationMessage', ({username, url, createdAt}) => {
	console.log(username);
	const html = Mustache.render(locationMessageTemplate, {
		username,
		url,
		createdAt: moment(createdAt).format('h:mm a')
	});

	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({room, users}) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});

	document.querySelector('#sidebar').innerHTML = html;
});

//on message submit
$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled');

	socket.emit('sendMessage', e.target.input.value, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if(error) {
			return console.log(error);
		}

		console.log('Message delivered');
	});
});

//on location button click
$sendLocationButton.addEventListener('click', () => {
	if(!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}

	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {

		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, (message) => {
			$sendLocationButton.removeAttribute('disabled');
			console.log(message);
		});
	})
});

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/'
	}
});

