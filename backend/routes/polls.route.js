import { Router } from "express";
import createNewPoll from "../controllers/createPoll.controller.js"
import castVote from "../controllers/vote.controller.js";
import sendPollDetails from "../controllers/sendPoll.controller.js";
const router = Router();


router.post("/makePoll", createNewPoll);
router.post("/vote", castVote)

router.get("/poll/:poll_id", sendPollDetails)

export default router