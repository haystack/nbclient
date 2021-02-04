
<template>
	<div class="chat">
		<div v-if="!ready">
			<button @click="addCurrentUser">Join Chat</button>
		</div>
		<div v-if="ready">
			<h4>My Chat App <span class="float-right">{{connections}} connections</span></h4>
				<div>
					<p v-for="user in info" :key=user.username>
						<i>{{user.username}} {{user.type}}</i>
					</p>
				</div>
				<ul class="list-group list-group-flush text-center">
					<small v-if="typing" class="text-white">{{typing}} is typing</small>
					<li v-for="message in messages" :key=message>
							<span :class="{'float-right':message.type === 0, 'float-left':message.type === 1, 'info-message':message.type === 2}">
									{{message.message}}
									<small>{{message.user}}</small>
							</span>
					</li>
				</ul>

				<div class="card-body">
					<form @submit.prevent="send">
							<div class="form-group">
									<input type="text" v-model="newMessage"
											placeholder="Enter message here">
							</div>
					</form>
				</div>
		</div>
	</div>

</template>
<script>
import axios from "axios";
// import io from "socket.io-client";

// const socket = io("https://127.0.0.1:3000", {reconnect: true});

export default {
	name: "nb-chat",
	props: {
    user: Object
  },
  data() {
    return {
      newMessage: "",
      messages: [],
      typing: false,
      username: null,
      ready: false,
      info: [],
      connections: 0,
    };
	},
	// created() {
	// 	this.username = this.user.username;

	// 	window.onbeforeunload = () => {
	// 		alert('leaving')
	// 		socket.emit('leave', this.username);
	// 	}

	// 	socket.on('chat-message', (data) => {
	// 		this.messages.push({
	// 				message: data.message,
	// 				type: 1,
	// 				user: data.user,
	// 		});
	// 	});

	// 	socket.on('typing', (data) => {
	// 		this.typing = data;
	// 	});


	// 	socket.on('stopTyping', () => {
	// 		this.typing = false;
	// 	});

	// 	socket.on('joined', (data) => {
	// 		this.messages.push({
	// 			message: data + " joined",
	// 			type: 2,
	// 			user: ""
	// 		});

	// 		// setTimeout(() => {
	// 		// 	this.info = [];
	// 		// }, 5000);
	// 	});

	// 	socket.on('leave', (data) => {
	// 		this.messages.push({
	// 			message: data + " left",
	// 			type: 2,
	// 			user: ""
	// 		});

	// 			// setTimeout(() => {
	// 			// 	this.info = [];
	// 			// }, 5000);
	// 	});

	// 	socket.on('connections', (data) => {
	// 			this.connections = data;
	// 	});
	// },
	watch: {
		newMessage(value) {
				// value ? socket.emit('typing', this.username) : socket.emit('stopTyping')
		}
	},
  computed: {
    
  },

	methods: {
		send() {
			this.messages.push({
				message: this.newMessage,
				type: 0,
				user: 'Me',
			});

			socket.emit('chat-message', {
				message: this.newMessage,
				user: this.username
			});
			this.newMessage = "";
		},

		addCurrentUser() {
			this.ready = true;
			// socket.emit('joined', this.username)
		}
	},
};
</script>

<style scoped>
	.float-right {
		float: right;
	}

	.float-left {
		float: left;
	}

	.text-center {
		text-align:center;
	}

	.info-message {
		font-style: italic;
	}
</style>