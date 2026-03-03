import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, subject, type, data } = await req.json();

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 're_123') {
      console.warn('Skipping email send: RESEND_API_KEY is missing or invalid');
      return NextResponse.json({ message: 'Email skipped (API key missing)' });
    }

    const resend = new Resend(resendApiKey);
    let html = '';

    if (type === 'enrollment_approved') {
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #0070f3; text-align: center;">Welcome to Markiety English!</h1>
          <p>Hi <strong>${data.name}</strong>,</p>
          <p>Great news! Your enrollment has been verified and approved. You can now access the student dashboard to start your journey.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Username:</strong> ${data.username}</p>
            <p style="margin: 0;"><strong>Password:</strong> ${data.password}</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://markiety.com'}/login" 
               style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login to Portal
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you have any questions, reply to this email or contact us on WhatsApp.
          </p>
        </div>
      `;
    } else if (type === 'homework_feedback') {
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0070f3;">Homework Reviewed 📚</h2>
          <p>Hi <strong>${data.name}</strong>,</p>
          <p>Your teacher has reviewed your submission for: <strong>${data.homeworkTitle}</strong>.</p>
          <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${data.feedback}"</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://markiety.com'}/dashboard" 
               style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View in Dashboard
            </a>
          </p>
        </div>
      `;
    }

    const { data: resData, error } = await resend.emails.send({
      from: 'Markiety English <academy@markiety.com>',
      to,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json(resData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
