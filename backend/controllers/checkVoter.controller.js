import Votes from "../models/votes.model.js";


export default async function checkVoter(req, res){
    const {voter_id, poll_id} = req.body;

    if(!voter_id || !poll_id){
        return res.status(400).json("Missing Id/Ids ")
    }

    try{
        let userVote = false;
        const alreadyVoted = await Votes.findOne({ pollid: poll_id, voterid: voter_id });
        if(alreadyVoted) userVote = true;
        return res.status(200).json({voted : userVote});
    }
    catch(err){
        return res.status(500).json(err)
    }
}