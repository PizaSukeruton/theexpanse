import fetch from 'node-fetch';

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const SMTP2GO_SENDER = process.env.SMTP2GO_FROM_EMAIL;

export async function sendVerificationEmail(userEmail, username, verificationLink) {
  const payload = {
    sender: SMTP2GO_SENDER,
    to: [userEmail],
    subject: 'Verify Your Email - TheExpanse',
    html_body: `
      <html>
        <body style="font-family: Courier New, monospace; background: #000000; color: #00ff75; padding: 20px;">
          <div style="border: 1px solid #00ff75; padding: 20px; background: rgba(0,32,0,0.28);">
            <h2>COUNCIL OF THE WISE</h2>
            <p>EMAIL VERIFICATION REQUIRED</p>
            <hr style="border: 1px solid #00ff75;">
            <p>Welcome, ${username}</p>
            <p>Please verify your email address to continue:</p>
            <p><a href="${verificationLink}" style="color: #00ff75; text-decoration: none; background: rgba(0,255,0,0.1); padding: 10px 20px; display: inline-block;">VERIFY EMAIL</a></p>
            <p style="font-size: 12px; opacity: 0.7;">This link expires in 24 hours.</p>
            <hr style="border: 1px solid #00ff75;">
            <p style="font-size: 12px; opacity: 0.7;">This is an automated message. Do not reply.</p>
          </div>
        </body>
      </html>
    `,
    text_body: `Welcome, ${username}\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link expires in 24 hours.\n\nThis is an automated message. Do not reply.`
  };

  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
      'accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok || data.request_id === null) {
    console.error('SMTP2GO error:', data);
    return { success: false, error: data.data?.error || 'Email send failed' };
  }

  console.log(`Verification email sent to ${userEmail}`);
  return { success: true, message: 'Email sent' };
}

export async function sendApprovalEmail(userEmail, username) {
  const payload = {
    sender: SMTP2GO_SENDER,
    to: [userEmail],
    subject: 'Your Account Has Been Approved - TheExpanse',
    html_body: `
      <html>
        <body style="font-family: Courier New, monospace; background: #000000; color: #00ff75; padding: 20px;">
          <div style="border: 1px solid #00ff75; padding: 20px; background: rgba(0,32,0,0.28);">
            <h2>COUNCIL OF THE WISE</h2>
            <p>ACCESS GRANTED</p>
            <hr style="border: 1px solid #00ff75;">
            <p>User: ${username}</p>
            <p>Your registration has been approved. You may now access the Dossier Terminal.</p>
            <p><a href="https://theexpanse.onrender.com/dossier-login.html" style="color: #00ff75; text-decoration: none;">LOGIN TO DOSSIER SYSTEM</a></p>
            <hr style="border: 1px solid #00ff75;">
            <p style="font-size: 12px; opacity: 0.7;">This is an automated message. Do not reply.</p>
          </div>
        </body>
      </html>
    `,
    text_body: `Your registration has been approved.\n\nYou may now login at: https://theexpanse.onrender.com/dossier-login.html\n\nThis is an automated message. Do not reply.`
  };

  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
      'accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok || data.request_id === null) {
    console.error('SMTP2GO error:', data);
    return { success: false, error: data.data?.error || 'Email send failed' };
  }

  console.log(`Approval email sent to ${userEmail}`);
  return { success: true, message: 'Email sent' };
}

export async function sendRejectionEmail(userEmail, username) {
  const payload = {
    sender: SMTP2GO_SENDER,
    to: [userEmail],
    subject: 'Registration Status - TheExpanse',
    html_body: `
      <html>
        <body style="font-family: Courier New, monospace; background: #000000; color: #ff4444; padding: 20px;">
          <div style="border: 1px solid #ff4444; padding: 20px; background: rgba(32,0,0,0.28);">
            <h2>COUNCIL OF THE WISE</h2>
            <p>ACCESS DENIED</p>
            <hr style="border: 1px solid #ff4444;">
            <p>User: ${username}</p>
            <p>Your registration request has been rejected.</p>
            <hr style="border: 1px solid #ff4444;">
            <p style="font-size: 12px; opacity: 0.7;">This is an automated message. Do not reply.</p>
          </div>
        </body>
      </html>
    `,
    text_body: `Your registration request has been rejected.\n\nThis is an automated message. Do not reply.`
  };

  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
      'accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok || data.request_id === null) {
    console.error('SMTP2GO error:', data);
    return { success: false, error: data.data?.error || 'Email send failed' };
  }

  console.log(`Rejection email sent to ${userEmail}`);
  return { success: true, message: 'Email sent' };
}
