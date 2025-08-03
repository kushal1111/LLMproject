import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel"; // Ensure you have a User model defined
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

connect();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User Email already exists" },
        { status: httpStatus.CONFLICT }
      );
    }
    const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      return NextResponse.json(
        { message: "UserName already in use. Please Try another" },
        { status: httpStatus.CONFLICT }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: httpStatus.CREATED }
    );
  } catch (error: unknown) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { message: (error as Error)?.message },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
