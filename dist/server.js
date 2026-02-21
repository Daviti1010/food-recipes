import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import pg from 'pg';
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/dist', express.static('dist'));
app.get("/", (req, res) => {
    res.render("index.ejs");
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map