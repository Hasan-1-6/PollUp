
import Poll from "../models/poll.model.js"
import Votes from "../models/votes.model.js";

export default async function castVote(req, res){
    const {poll_id, option_id, voter_id} = req.body;

    // const io = req.app.get("io");

    if(!poll_id || !option_id || !voter_id){
        return res.status(400).json("Insufficient data")
    }

    const poll = await Poll.findOne({ poll_id : poll_id });
    if(!poll) return res.status(404).json("Poll not found");

    if(Date.now() > poll.validity.getTime()){
        return res.status(400).json("Poll has been closed");
    }

    const alreadyVoted = await Votes.findOne({ pollid: poll_id, voterid: voter_id });
    if (alreadyVoted) {
        return res.status(403).json("Already voted");
    }

    try{
        const updatedPoll = await Poll.findOneAndUpdate(
        {
            poll_id, "options._id": option_id
        },
        {
            $inc: { "options.$.voteCount": 1 }
        },
            { new: true } //this returns new data after update
        );

        await Votes.create({
            pollid: poll_id,
            voterid: voter_id
        });
        // io.to(poll_id).emit("poll-update", updatedPoll )
        return res.status(201).json("Vote casted succesfully")
    }
    catch(err){
        return res.status(500).json(err)
    }
}