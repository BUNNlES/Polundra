const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");
const config = JSON.parse(fs.readFileSync("config.json"));
(async()=>{
	if(!fs.existsSync("words.json") || config.download_at_startup){
		console.log("Downloading.");
		let response = await fetch(config.words_url);
		fs.writeFileSync("words.json", await response.text());
	}
	const app = express();
	const port = config.port || 1337;
	app.get("/api/words.json", (request, response)=>{
		if(config.allow_fetching_all)response.json({error: false, data: JSON.parse(fs.readFileSync("words.json"))});
		else {
			response.status(403);
			response.json({
				error: true,
				message: "Forbidden."
			});
		}
	});
	app.get("/api/cword", (request, response)=>{
		if(config.allow_cword){
			let words = JSON.parse(fs.readFileSync("words.json"));
			return response.json({error: false, data: words[Math.floor(Math.random()*words.length)] + " " + words[Math.floor(Math.random() * words.length)]});
		}else{
			response.status(403);
			response.json({
				error: true,
				message: "Forbidden."
			});
		}
	});
	app.get("/api/words", (request, response)=>{
        let count = 0;
        let words = JSON.parse(fs.readFileSync("words.json"));
        if(!config.allow_words){
        	response.status(403);
        	response.json({
        		error: true,
        		message: "Forbidden."
        	});
        	return;
        }
		try {
			count = parseInt(request.query.w);
			if(isNaN(count))throw new Error();
			if(count <= 0 || count > words.length)throw new Error();
		}catch(e){
			response.status(400);
			response.json({
				error: true,
				message: "Bad request."
			});
			return;
		}
		let resp = [];
		for(let i = 0; i < count; i++){
			resp.push(words[Math.floor(Math.random()*words.length)]);
		}
		return response.json({error: false, data: resp});
	});
	app.listen(port, () => {
		console.log("Serving at localhost:" + port.toString() + ".");
	});
})();
