import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // this means do not ask for other fields like password, before saving , we are just adding tokens 
        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validation of the data
    //check if user already exists - check from username and email
    //check for images, check for avatar
    //if both are present, upload to cloudinary
    //create a user object - make an entry in mongodb
    //remove password and refresh token field from the response before sending to frontend
    //check for user creation - null response or user created?
    //return the response or return error

    const {fullname,username,email,password} = req.body
    
    if([fullname,username,email,password].some((field)=>{
        return (field?.trim==="");
    }))
    {
        throw new ApiError(400,"All fields is required")
    }

    const existedUser= await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser)
    {
        throw new ApiError(409,"User with email or username already exists")
    }
    console.log("REQ FILES: ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath= req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }

   if(!avatarLocalPath)
   {
        throw new ApiError(400,"Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   let coverImage = null;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

   if(!avatar)
   {
    throw new ApiError(400,"Avatar not found")
   }

   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser)
   {
    throw new ApiError(500,"Something went wrong while registering the user !")

   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully!",)
   )
})

const loginUser = asyncHandler(async (req,res)=>{
    //bring data from req.body
    //username or email for login
    // find the user in the DB
    //if not user, say user not found
    //if user found, check for password
    // if password wrong, say wrong password
    //if password ok, give access and refresh token
    //send them in cookies and response that login successful

    const {email,username,password} = req.body

    if(!username && !email)
    {
        throw new ApiError(400,"username or password is required");
    }

    const user = await User.findOne({
        $or: [{username},{email}] // either find on the basis of username OR on basis of email
    })

    if(!user)
    {
        throw new ApiError(404,"User is not registered");
    }

    const isPassValid= await user.isPasswordCorrect(password);

    if(!isPassValid)
    {
        throw new ApiError(401,"Password is incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-refreshToken -password");
    const options = {
        httpOnly: true,
        secure: true,
        //when these 2 are true, cookies are only modifiable through server
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {user: loggedInUser, refreshToken, accessToken},// we are sending this here in case user want to save their tokens 
            "User logged in successfully!"
        )
    )


})

const logoutUser = asyncHandler(async (req,res)=>{
    //cookies should be cleared
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {refreshToken: undefined},
        },
        {
            new: true // this is needed so that mongoose returns the object after updating it in DB
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        //when these 2 are true, cookies are only modifiable through server
    }

    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out!"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    try {
        const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken)
        {
            throw new ApiError(401, "No incoming token found")
        }
    
        const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user)
        {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401, "Rerfresh token is expired!")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
            //when these 2 are true, cookies are only modifiable through server
        }
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse
            (
                200,
                {
                accessToken,refreshToken
                },
                "Access token refreshed!"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }


})
export {loginUser,registerUser,logoutUser,refreshAccessToken}