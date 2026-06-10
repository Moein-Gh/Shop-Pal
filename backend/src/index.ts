import cors from "cors";
import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import { createServer } from "http";
import router from "./router.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const server = createServer(app);

const PORT = process.env["PORT"] ?? 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
