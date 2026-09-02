import { app } from "../index.js";
import { connectDB } from "../src/lib/db.js";

let connected = false;

export default async function handler(req: any, res: any) {
    if (!connected) {
        await connectDB();
        connected = true;
    }
    return app(req, res);
}
