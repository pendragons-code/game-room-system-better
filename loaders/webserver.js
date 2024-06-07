const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const helmet = require("helmet");
const requestIp = require("request-ip");
const { join } = require("path");
const middleWares = require("../config/rateLimit.js");
const routeManager = require("./route.js");

require("./socketEvents.js");
require("../utils/currentDateTime.js");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const server = http.createServer(app);
const port = process.env.port || 3000;
global.io = socketio(server);

const { QuickDB } = require("quick.db");
global.db = new QuickDB({ filePath: "DATABASE/Database.sqlite" });

app.use(middleWares);
app.use(helmet({
	contentSecurityPolicy: false,
	nosniff: true,
	xssFilter: true,
	hsts: { maxAge: 31536000, includesSubDomains: true }
}));

app.use(function(req, res, next){
	res.setHeader("Content-Security-Policy", "frame-ancestors 'self';")
	next()
})

app.use(requestIp.mw());

app.use((req, res, next) => {
	//const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const ip = req.clientIp; // we will probably need to change this because nginx and proxying
	appendFile("Logs/ipLog.txt", `[${new Date()}] Client IP: ${ip}\n`, (error) => {
		if(error) console.error("Could not write ip to logfile", error);
	});
	next();
});

app.use("trust proxy", true);
app.use(express.static(join(__dirname, "../client/public")));

app.use(function(req, res) {
	res.sendFile("../client/public/html/404.html");
});

app.use("/", routeManager);

server.listen((port), async () => {
	console.log(`Hanging onto dear life at ${process.pid}\nCurrently listening at http://localhost:${port}!`);
});
