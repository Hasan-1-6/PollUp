import redis from "../db/redis.js";
import Poll from "../models/poll.model.js";


const sendPollDetails = async (req, res) => {
    const {poll_id} = req.params;

    if(!poll_id) return res.status(400).json("Missing Poll Id");

    try{
        let pollRes = await redis.json.get(`poll:${poll_id}`);
        if(pollRes){
            return res.status(200).json(pollRes);
        }
        
        pollRes = await Poll.findOne({ poll_id : poll_id })
        if(!pollRes) 
            return res.status(404).json("Poll not found");

        const multiClient = redis.multi();
        multiClient.json.set(`poll:${poll_id}`, `$`, pollRes.toJSON());
        multiClient.pExpireAt(`poll:${poll_id}`, pollRes.expiry.getTime());
        await multiClient.exec();

        return res.status(200).json(pollRes);
    }
    catch(err){
        return res.status(500).json(err);
    }
}

export default sendPollDetails;