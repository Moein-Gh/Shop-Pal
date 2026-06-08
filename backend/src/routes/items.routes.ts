import { Router } from "express";
import {
  addItem,
  checkItem,
  deleteItem,
  editItem,
  getItems,
  uncheckItem,
} from "../controllers/items.controller.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import {
  AddNewItemSchema,
  EditItemSchema,
  ItemIdSchema,
  ItemsForListSchema,
} from "../types/item.js";

const itemsRouter = Router();

itemsRouter.get("/:listId", validateParams(ItemsForListSchema), getItems);
itemsRouter.post("/", validate(AddNewItemSchema), addItem);
itemsRouter.patch("/:itemId", validateParams(ItemIdSchema), validate(EditItemSchema), editItem);
itemsRouter.patch("/check/:itemId", validateParams(ItemIdSchema), checkItem);
itemsRouter.patch("/uncheck/:itemId", validateParams(ItemIdSchema), uncheckItem);
itemsRouter.delete("/:itemId", validateParams(ItemIdSchema), deleteItem);

export default itemsRouter;
