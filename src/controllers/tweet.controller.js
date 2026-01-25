import { Tweet } from "../models/tweet.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req,res)=>{
    const {content} = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet should have some content!");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content
    })
    
    if(!tweet)
    {
        throw new ApiError(500,"Something went wrong while posting the tweet!")
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        tweet,
        "Tweet posted successfully!"
    ))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find({ owner: req.user._id })
                              .sort({ createdAt: -1 });

    if (!tweets.length) {
        throw new ApiError(404, "No tweets found for this user");
    }

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
});

const deleteUserTweet = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params;
    if(!tweetId)
    {
        throw new ApiError(400,"No tweetID found from params!")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet)
    {
        throw new ApiError(400,"No tweet found to delete!");
    }

    if(tweet.owner.toString()!== req.user?._id.toString())
    {
        // cannot delete this tweet
        throw new ApiError(403, "You cannot delete someone else's tweet!")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new ApiResponse(200,
            {},
            "Tweet deleted successfully!"
        )
    )

})
export {
    getUserTweets,
    deleteUserTweet,
    createTweet
}