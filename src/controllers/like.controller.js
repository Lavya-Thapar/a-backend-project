import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked")
        );
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Video liked successfully")
    );
});

const toggleLikeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid video ID");
        
    }

    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
        throw new ApiError(404, "tweet not found");
        
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked")
        );
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Tweet liked successfully")
    );
});

const toggleLikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Comment.findById(commentId);
    if (!video) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked")
        );
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Comment liked successfully")
    );
});

const getAllLikesOnTweet = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweetExists = await Tweet.exists({ _id: tweetId });
    if (!tweetExists) {
        throw new ApiError(404, "Tweet not found");
    }

    const allLikes = await Like.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedByUsers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$likedByUsers" },
        { $replaceRoot: { newRoot: "$likedByUsers" } }
    ])

    console.log("recieved liked data: ", allLikes)

    return res.status(200)
    .json(new ApiResponse(
        200,
        allLikes,
        "likes found successfully!"
    ))

})

const getAllLikesOnComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const commentExists = await Comment.exists({ _id: commentId });
    if (!commentExists) {
        throw new ApiError(404, "Comment not found");
    }

    const allLikes = await Like.aggregate([
        {
            $match: {
                comment: new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedByUsers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$likedByUsers" },
        { $replaceRoot: { newRoot: "$likedByUsers" } }
    ])

    console.log("recieved liked data: ", allLikes)

    return res.status(200)
    .json(new ApiResponse(
        200,
        allLikes,
        "likes found successfully!"
    ))

})

const getAllLikesOnVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoExists = await Video.exists({ _id: videoId });
    if (!tweetExists) {
        throw new ApiError(404, "Video not found");
    }

    const allLikes = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedByUsers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$likedByUsers" },
        { $replaceRoot: { newRoot: "$likedByUsers" } }
    ])

    console.log("recieved liked data: ", allLikes)

    return res.status(200)
    .json(new ApiResponse(
        200,
        allLikes,
        "likes found successfully!"
    ))

})


export {
    toggleLikeVideo,
    toggleLikeTweet,
    toggleLikeComment,
    getAllLikesOnTweet,
    getAllLikesOnComment,
    getAllLikesOnVideo
}