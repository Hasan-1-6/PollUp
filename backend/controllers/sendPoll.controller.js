import Poll from "../models/poll.model.js";


const sendPollDetails = async (req, res) => {
    const {poll_id} = req.params;

    if(!poll_id) return res.status(400).json("Missing Poll Id");

    try{
        const pollRes = await Poll.findOne({ poll_id : poll_id })
        if(!pollRes) return res.status(404).json("Poll not found");

        return res.status(200).json(pollRes);
    }
    catch(err){
        return res.status(500).json(err);
    }
}

export default sendPollDetails;