import Poll from "../models/poll.model.js"
import { nanoid } from "nanoid";


export default async function createNewPoll(req, res){
    const {title, options, expiry} = req.body;
    
    if(!title || !options || options.length === 0){
        return res.status(400).json("Error, Insufficient data provided")
    }
    
    const poll_id = nanoid(8);

    //stop poll after expiryNum days
    const expiryNum = Number(expiry);
    const expiry_date = new Date(Date.now() + expiryNum * 24 * 60 * 60 * 1000 )
    //delete after 30 days 
    const deleteDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  //TODO HERE
    
    const optionsFields = options.map(title => {
        return {
            optionTitle : title,
            voteCount : 0,
        }
    });
    try{
        const newPoll = new Poll({
            poll_id : poll_id,
            title : title,
            options : optionsFields, //TODO HERE
            validity : expiry_date,
            expiry : deleteDate
        })
        await newPoll.save();

        return res.status(201).json({slug : poll_id});
    }
    catch(err){
        return res.status(500).json(err);
    }
}