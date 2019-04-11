const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname,'..','public');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));



io.on('connection', (socket) => {
	console.log('New WebSocket connection');

	socket.on('join', ({ username , room}, callback) => {
		const {error, user} = addUser({
			id: socket.id,
			username,
			room
		});

		if(error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message' , generateMessage('Admin','Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined!`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});


		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);

		if(filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io.to(user.room).emit('message', generateMessage(user.username, message));
		callback('');
	});

	socket.on('sendLocation', ({latitude, longitude}, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`));
		callback('Location shared')
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if(user) {
			io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});
	// socket.emit('countUpdated', count);
	//
	// socket.on('increment', () => {
	// 	count++;
	// 	// socket.emit('countUpdated', count);
	// 	io.emit('countUpdated', count)
	// });
});

server.listen(port,() => {
	console.log(`App is running on port ${port}`);
});



