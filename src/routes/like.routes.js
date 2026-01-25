import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllLikesOnComment, getAllLikesOnTweet, getAllLikesOnVideo, toggleLikeComment, toggleLikeTweet, toggleLikeVideo } from "../controllers/like.controller.js";

const likeRouter = Router()


likeRouter.route("/toggle-like-video/:videoId").post(verifyJWT, toggleLikeVideo)
likeRouter.route("/toggle-like-tweet/:tweetId").post(verifyJWT, toggleLikeTweet)
likeRouter.route("/toggle-like-comment/:commentId").post(verifyJWT, toggleLikeComment)
likeRouter.route("/get-likes-tweet/:tweetId").post(verifyJWT, getAllLikesOnTweet)
likeRouter.route("/get-likes-comment/:commentId").post(verifyJWT, getAllLikesOnComment)
likeRouter.route("/get-likes-video/:videoId").post(verifyJWT, getAllLikesOnVideo)

export default likeRouter