import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";

// Simple in-memory rate limiting
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const rateLimitStore: { [key: string]: { count: number, timestamp: number } } = {};

// This should be a long, secure random string. In a real app, this would be an environment variable.
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: Request) {
  const { userId } = auth();

  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const userRateLimit = rateLimitStore[clientIp];

  if (userRateLimit && now - userRateLimit.timestamp < RATE_LIMIT_DURATION) {
    if (userRateLimit.count >= MAX_REQUESTS) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    userRateLimit.count++;
  } else {
    rateLimitStore[clientIp] = { count: 1, timestamp: now };
  }

  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 });
    }

    // Generate custom JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: primaryEmail,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Return token and metadata
    return NextResponse.json({
      token,
      userId: user.id,
      email: primaryEmail,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ 
      error: "Failed to generate token", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

