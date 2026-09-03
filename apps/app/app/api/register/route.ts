import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      username?: unknown;
      email?: unknown;
      password?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const username =
      typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !username || !email || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Enter a name, username, valid email, and password of at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "That email is already registered." },
        { status: 409 },
      );
    }

    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, username, email, password: hashedPassword },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}