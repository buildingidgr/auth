import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { clerkToken } = await request.json();

    if (!clerkToken) {
      return NextResponse.json({ error: "No Clerk token provided" }, { status: 400 });
    }

    // Verify Clerk token
    const clerkSession = await clerkClient.sessions.verifySession(clerkToken, clerkToken);

    if (!clerkSession) {
      return NextResponse.json({ error: "Invalid Clerk token" }, { status: 401 });
    }

    const userId = clerkSession.userId;
    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 });
    }

    // Generate Necha auth token
    const nechaToken = await new SignJWT({
      userId: user.id,
      email: primaryEmail,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Calculate expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Return Necha auth token and metadata
    return NextResponse.json({
      token: nechaToken,
      userId: user.id,
      email: primaryEmail,
      expiresAt,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json({ 
      error: "Failed to exchange token", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

