function logError(error, details) {
	console.log("============================== New Error ==============================");
	console.error("============================== New Error ==============================");
	console.log(error);
	if(details) {
		console.log(`[${currentDateTime()}] ${details}`);
		console.error(`[${currentDateTime()}] ${details}`); // e.g socket error or express server error
	}
	console.log(`[${currentDateTime()}] ${error}`);
	console.error(`[${currentDateTime()}] ${error}`);
	console.log("============================== End Error ==============================");
	console.log(error);
	console.error("============================== End Error ==============================");
}
// initially wanted to integrate discord.js in this to log errors and send to my server or dms
module.exports = { logError };
