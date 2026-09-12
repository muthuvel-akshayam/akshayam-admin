import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const cleanPhone = phone?.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP record to database
    await prisma.otpVerification.create({
      data: {
        phone: cleanPhone,
        otp,
        expiresAt,
      },
    });

    const apiKey = process.env.FAST2SMS_API_KEY;

    // Local fallback if API key is not configured yet
    if (!apiKey || apiKey.includes("your_fast2sms")) {
      console.log("==========================================");
      console.log(`[DEV OTP SMS] Phone: ${cleanPhone} | OTP: ${otp}`);
      console.log("==========================================");
      return NextResponse.json({
        success: true,
        message: "OTP அனுப்பப்பட்டது (Development mode - check terminal)",
      });
    }

    // Fast2SMS Quick OTP API Call
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: cleanPhone,
      }),
    });

    const result = await response.json();

    if (result.return) {
      return NextResponse.json({
        success: true,
        message: "OTP உங்கள் மொபைல் எண்ணிற்கு அனுப்பப்பட்டது",
      });
    } else {
      console.error("Fast2SMS Error:", result);
      return NextResponse.json(
        { success: false, message: result.message || "SMS அனுப்புவதில் பிழை ஏற்பட்டது" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Fast2SMS Catch Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
