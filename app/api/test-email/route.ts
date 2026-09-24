import { NextResponse } from "next/server";
import { sendTestEmail } from "@/services/emails";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const result = await sendTestEmail(email);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent. Check your inbox.",
      id: result.data?.id 
    });
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json(
      { error: "Failed to send test email. Check Resend API key." },
      { status: 500 }
    );
  }
}
