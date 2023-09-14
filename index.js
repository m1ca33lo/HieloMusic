//JotaroKujo0525 note, this is a deed that i should've done a long time ago
const HieloMusic = require("./lib/HieloMusic");
const { exec } = require("child_process");

if (process.env.REPL_ID) {
	console.log("Replit system detected, initiating special `unhandledRejection` event listener.")
	process.on('unhandledRejection', (reason, promise) => {
		promise.catch((err) => {
			if (err.status === 429) {
				console.log("something went wrong whilst trying to connect to discord gateway, resetting...");
				exec("kill 1");
			}
		});
	});
} //https://github.com/wtfnotavailable/Discord-MusicBot/tree/fc56462cef00d7ff8bed76d0613444a2072e0972/dashboard/src/pages

const client = new HieloMusic();

console.log("Make sure to fill in the config.js before starting the bot.");

const getClient = () => client;

module.exports = {
	getClient,
};
