export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Verify JSON headers
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ success: false, error: "Content-Type must be application/json" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { name, email, subject, message } = await request.json();

    // 2. Validate input fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Please fill out all fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid email address." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Retrieve Resend API Key secret
    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Resend API key is not configured in Cloudflare environment bindings." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Send API request to Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "CreatorsFeel Contact <onboarding@resend.dev>",
        to: ["business.rajbhar@gmail.com"],
        reply_to: email,
        subject: `[Contact Form] ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">New Message from CreatorsFeel</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px; margin-top: 15px;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 0.95rem; color: #1e293b;">${message}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Sent automatically from creatorsfeel.com contact page.</p>
          </div>
        `
      })
    });

    // 6. Handle Resend API response
    if (resendResponse.ok) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await resendResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorData.message || "Failed to send email via Resend API. Please check your setup." 
        }),
        { status: resendResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
