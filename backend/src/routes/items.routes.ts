import { Router } from "express";
import {
  addItem,
  batchAddItems,
  batchCheckItems,
  batchDeleteItems,
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
  BatchAddItemsSchema,
  BatchCheckItemsSchema,
  BatchDeleteItemsSchema,
  EditItemSchema,
  ItemIdSchema,
  ItemsForListSchema,
} from "../types/item.js";

const itemsRouter = Router();

itemsRouter.post("/batch", validate(BatchAddItemsSchema), batchAddItems);
itemsRouter.patch("/batch/check", validate(BatchCheckItemsSchema), batchCheckItems);
itemsRouter.delete("/batch", validate(BatchDeleteItemsSchema), batchDeleteItems);

itemsRouter.get("/:listId", validateParams(ItemsForListSchema), getItems);
itemsRouter.post("/", validate(AddNewItemSchema), addItem);
itemsRouter.patch("/:itemId", validateParams(ItemIdSchema), validate(EditItemSchema), editItem);
itemsRouter.patch("/check/:itemId", validateParams(ItemIdSchema), checkItem);
itemsRouter.patch("/uncheck/:itemId", validateParams(ItemIdSchema), uncheckItem);
itemsRouter.delete("/:itemId", validateParams(ItemIdSchema), deleteItem);

export default itemsRouter;
