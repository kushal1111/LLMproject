import {connect} from "@/dbConfig/dbConfig"
import User from "@/models/userModel"; // Ensure you have a User model defined
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

connect()
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // Find user by email
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: httpStatus.NOT_FOUND });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: httpStatus.UNAUTHORIZED });
        }
        // create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }
        // Generate JWT token
        const token = jwt.sign(tokenData, process.env.JWT_SECRET || 'my_secret_key', {expiresIn: "1h"}) // Token expiration time
        
        // Return success response with user data (excluding password)
        const { password: _, ...userData } = user.toObject();
        const response = NextResponse.json({ message: "Login successful", user: userData, success: true }, { status: httpStatus.OK });
        response.cookies.set("token", token, {
            httpOnly: true,
        })
        return response;
    } catch (error: unknown) {
        console.error("Error in login:", error);
        return NextResponse.json({ message: (error as Error)?.message }, { status: httpStatus.INTERNAL_SERVER_ERROR });
    }
}