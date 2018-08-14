'use strict';

const DOMAIN = process.env.DOMAIN || null;
if (DOMAIN === null) {
	throw new Error("No DOMAIN provided");
}
const KEY = process.env.KEY || null;
if (KEY === null) {
	throw new Error("No KEY provided");
}
const POLL_MS = process.env.POLL_MS || 300000;
const TIMEOUT_MS = process.env.TIMEOUT_MS || 1000;

const axios = require("axios");
const qs = require("querystring");
let lastIp = null;

const ipifyUrl = "https://api.ipify.org?format=json";

const getIpAddress = async function(url) {
	log("Fetching external IP");
	try {
		const response = await axios.get(
			url,
			{},
			{
				timeout: 1000
			}
		);
		log("External IP found");
		return response.data.ip;
	} catch (error) {
		log(error);
	}
}

const heUrl = "https://dyn.dns.he.net/nic/update";

const updateIpAddress = async function(ip) {
	if (ip == lastIp) {
		log("Not updating IP - not changed");
		return;
	}
	log("IP has changed");
	log("Attempting to update IP");
	try {
		const response = await axios.post(
			heUrl,
			qs.stringify({
				hostname: DOMAIN,
				password: KEY,
				myip: ip
			}),
			{
				timeout: 1000
			}
		);

		if (response.status !== 200) {
			throw new Error(response.data);
		}
		let result = response.data.split(" ");
		if (result[0] !== "good") {
			log(response.data);
		}

		log("Update successful");
	} catch (e) {
		log(e);
	}
	lastIp = ip;
}

const log = (thing) => {
	let date = new Date();
	let time = date.toUTCString();
	console.log(`[${time}]`, thing)
}

log(`Starting updater. Poll frequency: ${POLL_MS}ms`);
setInterval(() => {
	getIpAddress(ipifyUrl)
		.then(updateIpAddress);
}, POLL_MS);
