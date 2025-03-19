import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import AsyncHandler from "../utils/AsyncHandler"
import bcrypt from 'bcrypt'
import db from "@repo/database/client"
import { Request, Response } from "express"
import { uploadOnCloudinary } from "../utils/cloudinary"


const RegisterUser = AsyncHandler(async (req : Request, res :Response ) => {
    const {email , name , phone , password , profileImage } = req.body;
    console.log(req.body)

    try {
        if (!email || !name || !phone || !password) {
            throw new ApiError(400, "All fields are required")
        }
        const existingUser = await db.user.findFirst({
            where : {
                email : email
            }
        })
        if (existingUser) {
            throw new ApiError(400, "User already exists")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (profileImage){
            // upload image to cloudinary first then save it in database
            const imageUrl  = await uploadOnCloudinary(profileImage);
            const newUser = await db.user.create({
                data : {
                    email : email,
                    name : name,
                    phone : phone,
                    password : hashedPassword,
                    profileImgLink : imageUrl.url,
                    createdBy: name,
                    modifiedBy: name,
                    UserRole : "RESTAURANTADMIN"
                }
            })
            if (!newUser) {
                throw new ApiError(500, "Something went wrong")
            }
            return res.status(201).json(
                new ApiResponse(201, newUser, "User created successfully")
            )
        } else {
            const newUser = await db.user.create({
                data : {
                    email : email,
                    name : name,
                    phone : phone,
                    password : hashedPassword,
                    createdBy: name,
                    modifiedBy: name,
                    UserRole : "RESTAURANTADMIN"
                }
            })
            if (!newUser) {
                throw new ApiError(500, "Something went wrong")
            }
            return res.status(201).json(
                new ApiResponse(201, newUser, "User created successfully")
            )
        }
        
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            )
        } else {
            return res.status(500).json(
                new ApiResponse(500, null, "Error While Registering User")
            )
        }
        
    }
   
});


const LoginUser = AsyncHandler(async (req : Request, res :Response) => {
    const {email , password } = req.body;

    try {
        if (!email || !password) {
            throw new ApiError(400, "All fields are required")
        }
        const existingUser = await db.user.findFirst({
            where : {
                email : email
            }
        })
        if (!existingUser) {
            throw new ApiError(400, "User does not exist")
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid credentials")
        }
       
       
        
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            )
        } else {
            return res.status(500).json(
                new ApiResponse(500, null, "Error While Logging In User")
            )
        }
    }
});



export {
    RegisterUser,
    LoginUser

}