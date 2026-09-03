import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/services/email-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any previous tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Store new verification token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Construct reset URL based on current origin or env
      const origin =
        request.headers.get("origin") ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3002";
      const resetUrl = `${origin}/reset-password?token=${token}`;

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name,
      });
    }

    // Always return success for security (prevents user email enumeration)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    return NextResponse.json(
      { error: "Unable to process request right now. Please try again." },
      { status: 500 },
    );
  }
}

