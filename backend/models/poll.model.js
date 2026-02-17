import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    optionTitle : {
        type : String,
        required : true,
    },
    voteCount : {
        type : Number,
        required : true,
    }
})

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
    options : {
        type : [optionSchema],
        required : true,
    },
    validity : {
        type: Date,
        required: true
    },
    expiry : {
        type : Date,
        required : true,
        index : { expires : 0} //Will get deleted as soon as expiry is reached
    }
})

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;