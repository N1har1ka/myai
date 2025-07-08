import "dotenv/config.js";
const port = process.env.PORT || 3000;
import http from "http";
import app from "./app.js";

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
