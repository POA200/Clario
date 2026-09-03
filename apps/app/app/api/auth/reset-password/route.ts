import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const token = body.token?.trim();
    const password = body.password;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    // Find valid, non-expired verification token
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { error: "This password reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const email = record.identifier.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Clean up used verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return NextResponse.json(
      { error: "Unable to reset password right now. Please try again." },
      { status: 500 },
    );
  }
}

