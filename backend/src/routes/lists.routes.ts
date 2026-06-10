import { Router } from "express";
import {
  createList,
  getLists,
  renameList,
  deleteList,
  getMembers,
  addMember,
  removeMember,
  getInvitations,
  acceptInvitation,
  declineInvitation,
} from "../controllers/lists.controller.js";
import { validate } from "../middleware/validate.js";
import { NewListSchema } from "../types/list.js";

const listsRouter = Router();

listsRouter.get("/", getLists);
listsRouter.post("/", validate(NewListSchema), createList);
listsRouter.get("/invitations/pending", getInvitations);
listsRouter.patch("/:listId", renameList);
listsRouter.delete("/:listId", deleteList);
listsRouter.get("/:listId/members", getMembers);
listsRouter.post("/:listId/members", addMember);
listsRouter.delete("/:listId/members/:memberId", removeMember);
listsRouter.post("/:listId/invitations/accept", acceptInvitation);
listsRouter.post("/:listId/invitations/decline", declineInvitation);

export default listsRouter;
