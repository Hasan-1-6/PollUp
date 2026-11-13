import mongoose from "mongoose";

// Sub-schema for individual options
const optionSchema = new mongoose.Schema({
    optionTitle : {
        type : String,
        required : true,
    },
    voteCount : {
        type : Number,
        required : true,
        default: 0
    }
}, { _id: false }); // Disable automatic _id generation here since the map key IS the ID

const pollSchema = new mongoose.Schema({
    poll_id : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    // Using a Map allows dynamic keys (like nanoid strings) 
    // pointing to objects that follow the optionSchema
    
    // options : { nanoid : { optionSchema } } like this
    options : { 
        type: Map,
        of: optionSchema,
        required: true,
    },
    validity : {
        type: Date,
        required: true
    },
    expiry : {
        type : Date,
        required : true,
        index : { expires : 0 }
    }
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;