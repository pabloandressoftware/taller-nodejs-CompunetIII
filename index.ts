import express, { Express } from "express";
import { Db } from "mongodb";
import { router } from "./src/routes/api.routes";

const app: Express = express();

const port: number = 8080;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use('/api', router);

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
});