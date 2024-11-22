import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const rateLimitStore: { [key: string]: { count: number, timestamp: number } } = {};

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
    // Get user details
    const user = await auth().getUser(userId);

    // Generate JWT token with custom claims
    const token = await auth().createToken({
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
      expiration: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });

    // Return token and metadata
    return NextResponse.json({
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ 
      error: "Failed to generate token", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

