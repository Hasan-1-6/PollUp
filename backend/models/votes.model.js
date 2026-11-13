import mongoose from "mongoose";

const votesSchema = new mongoose.Schema({
    pollid : {
        type : String,
        required : true,
    },
    voterid : {
        type : String,
        required : true
    }
})

votesSchema.index({ pollid: 1, voterid: 1 }, { unique: true });

const Votes = mongoose.model("Votes", votesSchema);
export default Votes;