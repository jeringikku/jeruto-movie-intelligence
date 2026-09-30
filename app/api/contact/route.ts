import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUBJECT_LABELS: Record<string, string> = {
  "data-correction": "Data Correction",
  "box-office": "Box Office / Trade Data",
  copyright: "Copyright & Content",
  business: "Business / Collaboration",
  general: "General Enquiry",
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const website = String(body.website || "").trim();

    // Honeypot protection for simple bots
    if (website) {
      return NextResponse.json(
        { error: "Invalid submission." },
        { status: 400 }
      );
    }

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name is too long." },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: "Email address is too long." },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!SUBJECT_LABELS[subject]) {
      return NextResponse.json(
        { error: "Please select a valid enquiry topic." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Please provide a little more detail in your message." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 }
      );
    }

    /*
     * Basic rate protection:
     * Prevent the same email address from submitting
     * more than 3 enquiries within 10 minutes.
     */
    const tenMinutesAgo = new Date(
      Date.now() - 10 * 60 * 1000
    ).toISOString();

    const { count: recentCount, error: rateLimitError } =
      await supabaseAdmin
        .from("jmi_contact_messages")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("email", email)
        .gte("created_at", tenMinutesAgo);

    if (rateLimitError) {
      console.error(
        "Contact rate-limit check error:",
        rateLimitError
      );
    }

    if ((recentCount ?? 0) >= 3) {
      return NextResponse.json(
        {
          error:
            "Too many enquiries from this email address. Please try again later.",
        },
        { status: 429 }
      );
    }

    /*
     * Save the enquiry first.
     * This means we keep the communication even if
     * the email service temporarily fails.
     */
    const { data: contactMessage, error: insertError } =
      await supabaseAdmin
        .from("jmi_contact_messages")
        .insert({
          name,
          email,
          subject: SUBJECT_LABELS[subject],
          message,
          status: "new",
          email_sent: false,
        })
        .select("id")
        .single();

    if (insertError || !contactMessage) {
      console.error(
        "Contact message database error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "We could not save your message. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * Send the notification through Resend.
     *
     * The user's email is placed in Reply-To rather than
     * From, which is important for domain authentication.
     */
    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "JMI Contact <support@jeruto.com>",
          to: [
            "janalytics6@gmail.com",
            "support@jeruto.com",
          ],
          reply_to: email,
          subject: `[JMI Contact] ${SUBJECT_LABELS[subject]}`,
          text: [
            "New enquiry received through Jeruto Movie Intelligence.",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Subject: ${SUBJECT_LABELS[subject]}`,
            "",
            "Message:",
            message,
            "",
            `JMI Contact ID: ${contactMessage.id}`,
          ].join("\n"),
        }),
      }
    );

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend email error:",
        resendData
      );

      return NextResponse.json(
        {
          error:
            "Your message was saved, but the email notification could not be sent right now. Please try again later.",
        },
        { status: 500 }
      );
    }

    /*
     * Mark the database record as successfully emailed.
     */
    const { error: updateError } =
      await supabaseAdmin
        .from("jmi_contact_messages")
        .update({
          email_sent: true,
        })
        .eq("id", contactMessage.id);

    if (updateError) {
      console.error(
        "Contact email status update error:",
        updateError
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending your enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}