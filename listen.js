var http = require("http");
var server = http.createServer((req, res) => {console.log(JSON.stringify(req)); res.end("It worked")});
server.listen(443);
