const express = require("express");
const router = express.Router();
const { logError } = require("../utils/errorManager.js");
const { join } = require("path");

try {

	router.get("/", async (req, res) => {
		let dbVisitCounter = await db.get("visitCounter");
		await db.set(`request_${dbVisitCounter}`, req); // omg imagine how fat this db is gonna be, just logging all the requests LMAO
		res.sendFile(join(__dirname, '../client/public/html/index.html'));
	});


} catch(routeErrors) {
	logError(routeErrors);
}

module.exports = router;