import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne<{
      name?: string;
      firstName?: string;
      lastName?: string;
      email: string;
      passwordHash: string;
    }>({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const displayName =
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.email;

    return NextResponse.json({
      message: "Login successful.",
      user: {
        name: displayName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login API error", error);
    const message =
      error instanceof Error ? error.message : "";
    const isDbError =
      message.includes("MONGODB") ||
      message.includes("connect") ||
      message.includes("connection");
    return NextResponse.json(
      {
        error: isDbError
          ? "Database not configured or unavailable. Add MONGODB_URI to .env.local and ensure MongoDB is running."
          : "Unable to login. Please try again later.",
      },
      { status: 500 }
    );
  }
}

