import { resend } from "..";


async function SendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL || "noreply@example.com",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email.");
    }

    return data;
  } catch (err) {
    console.error("SendEmail Error:", err);
    throw new Error("Internal server error while sending email.");
  }
}

export { SendEmail };
