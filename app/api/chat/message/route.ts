import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // make sure you created auth.ts in project root
import { connectDB } from "@/lib/db/mongodb";
import Conversation from "@/lib/db/models/Conversation";
import { getChatResponse } from "@/lib/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ FIX: pass both parameters
    const response = await getChatResponse([], message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
