'use strict';

const DOMAIN = process.env.DOMAIN || null;
if (DOMAIN === null) {
	throw new Error("No DOMAIN provided");
}
const KEY = process.env.KEY || null;
if (KEY === null) {
	throw new Error("No KEY provided");
}
const POLL_MS = Number(process.env.POLL_MS) || 300000;
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS) || 1000;

const axios = require("axios");
const qs = require("querystring");
const interval = require("interval-promise");

const ipifyUrl = "https://api.ipify.org?format=json";
const heUrl = "https://dyn.dns.he.net/nic/update";

const getIpAddress = async function(url, timeout) {
	try {
		log(`Fetching external IP, with a timeout of ${timeout}ms`);
		const request = axios.create({
			timeout: timeout
		});
		const response = await request.get(url);
		log("External IP found");
		return response.data.ip;
	} catch (e) {
		throw new Error("Could not detect external IP: " + e.message);
	}
}

const updateIpAddress = async function(url, domain, key, ip, timeout) {
	try {
		log(`Updating IP address for ${domain}, with a timeout of ${timeout}ms`);
		const request = axios.create({
			timeout: TIMEOUT_MS
		});
		const response = await request.post(
			url,
			qs.stringify({
				hostname: domain,
				password: key,
				myip: ip
			})
		);

		if (response.status !== 200) {
			throw new Error("Bad response from server: " + response.data);
		}
		let result = response.data.split(" ");
		if (result[0] !== "good") {
			log(response.data);
		}
		log("Update successful");
		return true;
	} catch (e) {
		throw new Error("Could not update IP: " + e.message);
	}
}

const log = (thing) => {
	let date = new Date();
	let time = date.toISOString();
	console.log(`[${time}]`, thing)
}

let lastIp = null;
log(`Starting updater. Poll frequency: ${POLL_MS}ms`);
interval(async () => {
	try {
		let newIp = await getIpAddress(ipifyUrl, TIMEOUT_MS);
		if (newIp == lastIp) {
			log("Not updating IP. No change");
			return true;
		}
		log("IP has changed.");
		let result = await updateIpAddress(heUrl, DOMAIN, KEY, newIp, TIMEOUT_MS);
		lastIp = newIp;
		return true;
	} catch (e) {
		log(e.message);
		throw e;
	}
}, POLL_MS, {stopOnError: false});
