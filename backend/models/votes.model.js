import mongoose from "mongoose";

const votesSchema = new mongoose.Schema({
    pollid : {
        type : String,
        required : true,
        index : true
    },
    voterid : {
        type : String,
        required : true
    }
})

const Votes = mongoose.model("Votes", votesSchema);
export default Votes;