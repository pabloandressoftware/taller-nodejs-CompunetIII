import express, { Express } from "express";
import { Db } from "mongodb";
import { taskRouter } from "./src/routes/task.routes";
import { projectRouter } from "./src/routes/project.routes";

const app: Express = express();

const port: number = 8080;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use('/api/v1/project', projectRouter);
app.use('/api/v1/task', taskRouter);

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
});