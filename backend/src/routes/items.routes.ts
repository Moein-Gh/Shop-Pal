import { Router } from "express";
import { getItems } from "../controllers/items.controller.js";
import { validateParams } from "../middleware/validateParams.js";
import { ItemsForListSchema } from "../types/item.js";

const itemsRouter = Router();

itemsRouter.get("/:listId", validateParams(ItemsForListSchema), getItems);

export default itemsRouter;
