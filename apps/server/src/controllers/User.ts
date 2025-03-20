import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import AsyncHandler from "../utils/AsyncHandler"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

import db from "@repo/database/client"

import { Request, Response } from "express"
import { uploadOnCloudinary } from "../utils/cloudinary"
import { SendEmail } from "../lib/resend"
import {userSchema}  from "@repo/types/Schema";


const RegisterUser = AsyncHandler(async (req: Request, res: Response) => {
    const { email, name, phone, password } = req.body;
    const profileImage = req.file?.path;

    try {
          
        const {data , error } = userSchema.safeParse(req.body)
        
        if(error){
            throw new ApiError(400, error.message)
        }

        
        const existingUser = await db.user.findFirst({ where: { email : data.email } });
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(201).json(new ApiResponse(201, null, "Account is Verified"));
            }
            await SendEmail(email, "OTP for verification", `Your OTP is ${otp}`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let imageUrl = null;
        if (profileImage) {
            const uploadResult = await uploadOnCloudinary(profileImage);
            imageUrl = uploadResult.url;
        }

        const newUser = await db.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                otp,
                profileImgLink: imageUrl,
                createdBy: name,
                modifiedBy: name,
                UserRole: "RESTAURANTADMIN",
            },
        });

        if (!newUser) {
            throw new ApiError(500, "Something went wrong while creating the user");
        }

        await SendEmail(email, "OTP for verification", `Your OTP is ${otp}`);
        return res.status(201).json(new ApiResponse(201, newUser, "User created successfully , Please Verify Your Email"));

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }
        return res.status(500).json(new ApiResponse(500, null, "Error while registering user"));
    }
});


const VerifyUser = AsyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    
    console.log(req.body);

    try {
        if (!email || !otp) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await db.user.findFirst({
            where: { email }
        });

        if (!existingUser) {
            throw new ApiError(400, "User does not exist");
        }

        if (existingUser.otp !== otp) {
            throw new ApiError(400, "Invalid OTP");
        }

        await db.user.update({
            where: { email },
            data: {
                isVerified: true,
                otp: ""  
            }
        });
        const token = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                phone: existingUser.phone,
                profileImgLink: existingUser.profileImgLink,
                role: existingUser.UserRole,
                isVerified: existingUser.isVerified
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "10d" }
        );

        return res.status(200).json(
            new ApiResponse(200, {
                "access_token" : token
            }, "User verified successfully")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        } else {
            return res.status(500).json(
                new ApiResponse(500, null, "Error While Verifying User")
            );
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
        if (!existingUser.isVerified) {
            throw new ApiError(400, "User is not verified")
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid Credentials")
        }
        const token = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                phone: existingUser.phone,
                profileImgLink: existingUser.profileImgLink,
                role: existingUser.UserRole,
                isVerified: existingUser.isVerified
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "10d" }
        );

        return res.status(200).json(
            new ApiResponse(200, {
                "access_token" : token
            }, "User LoggedIn successfully")
        );
        
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
    LoginUser,
    VerifyUser

}