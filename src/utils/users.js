const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
	// Clean the data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();


	if (!username || !room) {
		return {
			error: 'Username and room are required'
		}
	}

	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	//validate username
	if (existingUser) {
		return {
			error: 'Username is in use!'
		}
	}

	//store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex(user => user.id === id);

	if(index!==-1) {
		return users.splice(index,1)[0];
	}
};

const getUser = (id) => {
	return users.find(user => user.id === id);
};

const getUsersInRoom = (room) => {
	return users.filter(user => user.room === room);
};


addUser({
	id: 22,
	username: 'Tai',
	room: 'Bremerton'
});

addUser({
	id: 44,
	username: 'Tai',
	room: 'silverdale'
});

addUser({
	id:33,
	username: 'ayy',
	room: 'bremerton'
});

console.log(getUser(22));
console.log(getUsersInRoom('bremerton'));

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
};