import mongoose from "mongoose";

export default async function connectDB(){
    console.log("Connecting to db....")
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB succesfully")
    }
    catch(err){
        console.log("Couldn't connect to DB");
        throw err;
    }
}