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
    // Generate JWT token
    const token = await auth().getToken({
      template: "supabase",
      expiration: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });

    // Get token expiration time
    const { exp } = JSON.parse(atob(token.split('.')[1]));

    // Return token and metadata
    return NextResponse.json({
      token,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}

