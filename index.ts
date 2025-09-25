import express, { Express } from "express";
import { Db } from "mongodb";
import { reviewRouter } from "./src/routes/review.routes";
import { playlistRouter } from "./src/routes/playlist.routes";

const app: Express = express();

const port: number = 8080;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/review', reviewRouter);

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
});