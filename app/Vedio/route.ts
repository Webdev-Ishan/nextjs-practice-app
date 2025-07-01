import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/DB";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const transformationSchema = z.object({
  height: z.number().default(1920),
  width: z.number().default(1080),
  quality: z.number().default(100),
});

export const vedioSchema = z.object({
  title: z.string().max(50),
  description: z.string().min(30).max(400),
  vedioURL: z.string(),
  thumbnailURL: z.string(),
  controls: z.boolean().default(true),
  transformations: transformationSchema,
});

export async function GET() {
  try {
    const vedios = (await prisma.vedio.findMany({})).sort();
    if (!vedios) {
      return NextResponse.json(
        {
          vedios: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        vedios,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Something went wrong",
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string | number } } | null;
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const parsedbody = vedioSchema.safeParse(data);
    if (!parsedbody.success) {
      return NextResponse.json(
        { success: false, error: parsedbody.error.format() },
        { status: 400 }
      );
    }

    const { title, description, vedioURL, thumbnailURL, controls, transformations } = parsedbody.data;

const vedio = await prisma.vedio.create({
  data: {
    title,
    description,
    vedioURL,
    thumbnailURL,
    controls,
    transformations, // This will always have height, width, quality
    userId: Number(session.user.id),
  },
});

    return NextResponse.json({ success: true, vedio }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
