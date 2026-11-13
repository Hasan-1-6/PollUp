
import Poll from "../models/poll.model.js"
import Votes from "../models/votes.model.js";
import redis from "../db/redis.js";
import { voteBatcher } from "../voteBatcher/voteBatcher.js";

export default async function castVote(req, res){
    const {poll_id, option_id, voter_id} = req.body;


    if(!poll_id || !option_id || !voter_id){
        return res.status(400).json("Insufficient data")
    }

    try{
        const pollData = await redis.json.get(`poll:${poll_id}`)
        if(!pollData) return res.status(400).json({ "message" : "Invalid Poll" });

        if(Date.now() > new Date(pollData.validity).getTime()){
            return res.status(400).json("Poll has been closed");
        }
        
        // vote.controller.js, before Votes.create
        if(!pollData.options?.[option_id]){
            return res.status(400).json({ message: "Invalid option" });
        }
        await Votes.create({ pollid: poll_id, voterid: voter_id }); // dedup gate first
        
        voteBatcher(poll_id, option_id);
        
        return res.status(201).json({option_id});
    }
    catch(err){
        if(err.code === 11000){
            return res.status(403).json("Already voted");
        }
        return res.status(500).json(err)
    }
}