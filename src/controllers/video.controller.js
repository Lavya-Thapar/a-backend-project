import { Video } from "../models/video.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadNewVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // files from multer
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is missing");
    }

    // upload to cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath, "video");
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

    if (!uploadedVideo?.url) {
        throw new ApiError(500, "Video upload failed");
    }

    if (!uploadedThumbnail?.url) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    // create DB entry
    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: uploadedVideo.duration, // Cloudinary gives this
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video uploaded successfully"
        )
    );
});


export {
    uploadNewVideo
}