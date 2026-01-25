import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";
import { uploadNewVideo } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route("/upload").post(
    verifyJWT,
    uploadVideo.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadNewVideo
);

export default videoRouter;
