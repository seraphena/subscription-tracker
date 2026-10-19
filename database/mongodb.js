import mongoose from "mongoose";
import { DB_URI,NODE_ENV } from "../config/env.js";


if(!DB_URI)
{
    throw new error("plz define the MOngo URi environment variable inside .env.<production/developement>.local ")
}

const connectToDatabase = async()=> {
    try 
    {
        await mongoose.connect(DB_URI);
        console.log("connected to the database in ${Node_env} mode");


    } 
    catch(error)
    {
        console.error("errpr conncecting to the database ",error);
        process.exit(1);

    }
}
export default connectToDatabase;