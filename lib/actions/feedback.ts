"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function submitFeedback(prevState: any, formData: FormData) {
  const content = formData.get("content") as string;
  const contactInfo = formData.get("contactInfo") as string;

  if (!content) {
    return { success: false, message: "反馈内容不能为空" };
  }

  try {
    // 1. Save to Database
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("app_feedback").insert({
      content,
      contact_info: contactInfo,
    });

    if (dbError) {
      console.error("Database Error:", dbError);
      throw new Error("Failed to save feedback");
    }

    // 2. Send Email
    // Only send if API Key is present, to prevent crash if not configured
    if (process.env.RESEND_API_KEY && ADMIN_EMAIL) {
      await resend.emails.send({
        from: "feedback@resend.dev", // Default testing domain, or user's configured domain
        to: ADMIN_EMAIL,
        subject: `[PTXMB] New Feedback from ${contactInfo || "Anonymous"}`,
        text: `Content: ${content}\n\nContact: ${contactInfo}`,
      });
    }

    return { success: true, message: "感谢您的反馈，我们已收到！" };
  } catch (error) {
    console.error("Feedback Error:", error);
    return { success: false, message: "提交失败，请稍后重试。" };
  }
}
