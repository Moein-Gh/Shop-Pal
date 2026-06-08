import { Router } from "express";
import { authentication } from "./middleware/authentication.js";
import authRoutes from "./routes/auth.routes.js";
import itemsRouter from "./routes/items.routes.js";
import listsRouter from "./routes/lists.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/items/", authentication, itemsRouter);
router.use("/lists/", authentication, listsRouter);

export default router;
