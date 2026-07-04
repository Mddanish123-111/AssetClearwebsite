import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { clientsRouter } from "./routes/clients";
import { jobsRouter } from "./routes/jobs";
import { assetsRouter } from "./routes/assets";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/assets", assetsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(Number(env.PORT), () => {
  console.log(`AssetClear API listening on port ${env.PORT}`);
});
