import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
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

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(
    verifyJWT,
    logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)// changing password is a secure action , so post is used, not patch
router.route("/current-user").get(verifyJWT, getCurrentUser) // get is used when details are not changed, only read
router.route("/update-accountDetails").patch(verifyJWT, updateAccountDetails) // patch is used when partial details have to be changed, not the complete resource
router.route("/upload-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) // whenever we are taking data from params, route endpoint has to be the same as destructured from params
router.route("/history").get(verifyJWT,getWatchHistory)

export default router