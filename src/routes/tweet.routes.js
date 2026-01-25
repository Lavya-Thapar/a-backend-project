import { Router } from "express";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteUserTweet, getUserTweets } from "../controllers/tweet.controller.js";

const tweetRouter = Router()

tweetRouter.route("/get-tweets").get(verifyJWT,getUserTweets)
tweetRouter.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteUserTweet)
tweetRouter.route("/create-tweet").post(verifyJWT, createTweet)

export default tweetRouter