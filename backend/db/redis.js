import {createClient} from "redis";

const redis = createClient({
    url : process.env.REDIS_URL || "redis://localhost:6379" 
})

try{
    await redis.connect();
}
catch(err){
    console.error(`Error connecting to Redis: ${err}`);
    process.exit(1);
}
redis.on(`error`, (err)=> console.log(`Error connecting to Redis: ${err}`))
export default redis;