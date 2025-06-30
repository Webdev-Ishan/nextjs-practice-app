import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/DB";
import bcrypt from "bcrypt";
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().min(9).max(100),
  password: z.string().min(6).max(20),
});
const saltvalue = process.env.salt_value;

export async function POST(req: NextRequest) {
  const data = await req.json();
  const parsedbody = registerSchema.safeParse(data);

  if (!parsedbody.success) {
    return NextResponse.json(
      { success: false, error: parsedbody.error.format() },
      { status: 400 }
    );
  }

  if (!saltvalue || isNaN(Number(saltvalue))) {
  return NextResponse.json(
    { success: false, error: "Invalid salt value in environment." },
    { status: 500 }
  );
}
  const { username, email, password } = parsedbody.data;

  try {
    const existUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (existUser) {
      return NextResponse.json(
        { success: false, error: "Account already exist, please login" },
        { status: 403 }
      );
    }

    const salt = await bcrypt.genSalt(Number(saltvalue));
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Something went wrong" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, username: user.username, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: "Something went wrong" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
