import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express"
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path: "./env"
})
const app = express()

connectDB()
/*Approach 2 of DB connection 
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log(error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App listening at port : ${process.env.PORT}`)
        })
    }
    catch(error){
        console.log("ERROR: ", error);
        throw error;
    }
})()
*/

