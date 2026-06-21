import * as http from 'node:http'

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer((req, res) => {
    if(req.method === "GET" && req.url == "/health"){
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: "ok"}));
        return;
    }

    if(req.method === "GET" && req.url == "/"){
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: "ok"}));
        return;
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

