import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const uploadImage = multer({ storage: storage })

const uploadVideo = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Only video & image files are allowed"), false);
        }
    }
});

export {uploadImage, uploadVideo}


