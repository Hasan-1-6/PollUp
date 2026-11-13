import Poll from "../models/poll.model.js"
import { nanoid } from "nanoid";
import redis from "../db/redis.js"

export default async function createNewPoll(req, res){
    const {title, options, expiry} = req.body;
    
    if(!title || !options || options.length === 0){
        return res.status(400).json("Error, Insufficient data provided")
    }
    
    const poll_id = nanoid(8);

    //stop poll after expiryNum days
    const expiryNum = Number(expiry);
    if(isNaN(expiryNum) || expiryNum < 1 || expiryNum > 7){
        return res.status(400).json("Invalid expiry value, must be between 1 and 7 days")
    }
    const expiry_date = new Date(Date.now() + expiryNum * 24 * 60 * 60 * 1000 )
    
    //delete after 30 days 
    const deleteDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  //TODO HERE
    
    const optionObject = {};

    options.forEach(title => {
        const opt_id = nanoid(5);
        optionObject[opt_id] = {
            optionTitle : title,
            voteCount : 0
        }
    });

    try{
        
        const newPoll = new Poll({
            poll_id : poll_id,
            title : title,
            options : optionObject,
            validity : expiry_date,
            expiry : deleteDate
        })
        await newPoll.save();
        
        const multiClient = redis.multi();
        multiClient.json.set(`poll:${poll_id}`, `$`, newPoll.toJSON());
        multiClient.pExpireAt(`poll:${poll_id}`, newPoll.expiry.getTime());
        await multiClient.exec();

        return res.status(201).json({slug : poll_id});
    }
    catch(err){
        return res.status(500).json(err);
    }
}