import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(
    uploadImage.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)

//secured routes

userRouter.route("/logout").post(
    verifyJWT,
    logoutUser)

userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)// changing password is a secure action , so post is used, not patch
userRouter.route("/current-user").get(verifyJWT, getCurrentUser) // get is used when details are not changed, only read
userRouter.route("/update-accountDetails").patch(verifyJWT, updateAccountDetails) // patch is used when partial details have to be changed, not the complete resource
userRouter.route("/upload-avatar").patch(verifyJWT, uploadImage.single("avatar"), updateUserAvatar)
userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile) // whenever we are taking data from params, route endpoint has to be the same as destructured from params
userRouter.route("/history").get(verifyJWT,getWatchHistory)


export default userRouter