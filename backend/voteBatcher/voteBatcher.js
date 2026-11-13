import redis from "../db/redis.js";
import Poll from "../models/poll.model.js";

const pendingVotes = new Map() //Contains pollid -> option.id -> cnt for Redis flush
const failedFlushes = new Set() //contains poll id of failed flushes to MongoDB

let io = null;


//to prevent circular dependency
export function initVoteBatcher(socketIo){
    io = socketIo;
}

export function voteBatcher(poll_id, option_id){
    if(!pendingVotes.has(poll_id)){
        pendingVotes.set(poll_id, {});
    }

    const poll = pendingVotes.get(poll_id);
    poll[option_id] = (poll[option_id] || 0) + 1;
}


async function syncVotes(poll_ids){
    if(poll_ids.length == 0 && failedFlushes.size === 0) return;

    const pollList = [ ...new Set([...poll_ids, ...failedFlushes])];
    const multiClient = redis.multi();
    
    pollList.forEach(poll_id => {
        multiClient.json.get(`poll:${poll_id}`);
    })
    let pollsData;
    try{
        pollsData = await multiClient.exec();
    }
    catch(err){
        console.error("Failed to fetch polls from Redis:", err);
        pollList.forEach(id => failedFlushes.add(id));
        return;
    }
    const updates = [];
    const writtenPollIds = [];
    
    pollsData.forEach((result, index) => {
        const poll_id = pollList[index];

        if(result instanceof Error){
            console.error(`Failed to fetch poll ${poll_id} from Redis:`, result.message);
            failedFlushes.add(poll_id);
            return; 
        }
        if(!result){
            console.warn(`Poll ${poll_id} has expired or does not exist in Redis.`);
            failedFlushes.delete(poll_id)
            return; 
        }
        
        io.to(poll_id).emit("poll-update", result);

        const optionsObj = {};
        for(const [option_id, optionData] of Object.entries(result.options)){
            optionsObj[`options.${option_id}.voteCount`] = optionData.voteCount;
        }
        writtenPollIds.push(poll_id);
        updates.push({
            updateOne : {
            filter : { poll_id },
            update : {$set : optionsObj},
        }})
    })
    if(updates.length === 0) return;

    try{
        await Poll.bulkWrite(updates, { ordered : false });
        writtenPollIds.forEach(id => failedFlushes.delete(id))
    }
    catch(err){
        if(err.name === 'MongoBulkWriteError'){
            err.writeErrors.forEach(resultErr => {
                failedFlushes.add(writtenPollIds[resultErr.index])
            })
        }
        else{
            console.error("Mongo mirror failed:", err);
            writtenPollIds.forEach(id => failedFlushes.add(id));
        }
    }
}


setInterval( async () => {
    if((pendingVotes.size === 0 && failedFlushes.size === 0) || !io) return;

    const ops = []
    const batch = new Map([...pendingVotes.entries()]);
    const multiClient = redis.multi();
    
    const poll_ids = [...batch.keys()]
    pendingVotes.clear();

    

    if(batch.size > 0){
        //then we need to push these to redis
        for(const [poll_id, options] of batch.entries()){
            for(const [option_id, count] of Object.entries(options)){
                ops.push({ poll_id, option_id, count });
                multiClient.json.numIncrBy(
                    `poll:${poll_id}`,
                    `$.options.${option_id}.voteCount`,
                    count
                )
            }
        }
        
        try{
            const results = await multiClient.exec()
            results.forEach((result, index) => {
                if(result instanceof Error){
                    const op = ops[index];
                    const poll = pendingVotes.get(op.poll_id) || {};
                    poll[op.option_id] = (poll[op.option_id] || 0) + op.count;
                    pendingVotes.set(op.poll_id, poll);
                }  
            })
        }catch(err){
            console.error(`Failed to flush votes into redis`, err);
            for(const op of ops){
                const poll = pendingVotes.get(op.poll_id) || {};
                poll[op.option_id] = (poll[op.option_id] || 0) + op.count;
                pendingVotes.set(op.poll_id, poll);
            }
            return;
        }   
        await syncVotes(poll_ids)
    }
}, 500);