import { Router } from "express";
import { createList, getLists } from "../controllers/lists.controller.js";
import { validate } from "../middleware/validate.js";
import { NewListSchema } from "../types/list.js";

const listsRouter = Router();

listsRouter.get("/", getLists);
listsRouter.post("/", validate(NewListSchema), createList);

export default listsRouter;
