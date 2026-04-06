/**
 * Ormeet Email Templates — Matching the frontend UI theme
 *
 * Theme tokens (from front-end/src/index.css):
 *   Primary:       #E0234E
 *   Primary Dark:  #F0450B
 *   Primary Light: #FFF4F3
 *   Logo gradient: #FF4000 → #FE784B
 *   Secondary:     #3178C6
 *   Success:       #34A853
 *   Error:         #FF3425
 *   Black:         #000000
 *   Dark Gray:     #434343
 *   Gray:          #4F4F4F
 *   Light Gray:    #EEEEEE
 *   Font:          Poppins, sans-serif
 */

const LOGO_SVG = `<svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25.4823 3.2568C25.7624 3.32823 25.9092 3.6233 25.7967 3.88959C25.2384 5.21111 23.5009 8.82814 20.7293 10.151C18.1076 11.4024 14.4725 10.7095 13.1653 10.3949C12.8914 10.329 12.7413 10.0481 12.8379 9.78343C13.3077 8.49569 14.7842 4.97963 17.3331 3.56463C20.0268 2.06919 24.0679 2.8961 25.4823 3.2568Z" fill="#FF4000"/><path d="M13.5989 13.4994C13.5989 13.4994 14.2563 11.4916 10.4009 8.98797C8.18338 7.54793 6.40802 7.57018 6.40802 7.57018" stroke="#FF4000" stroke-width="1.42267" stroke-linecap="round"/><path d="M11.9843 13.0219C11.9843 13.0219 12.1858 11.9658 12.4951 11.3583C12.7888 10.7817 13.4749 10.0293 13.4749 10.0293" stroke="#FF4000" stroke-width="1.42267" stroke-linecap="round"/><path d="M13.5527 10.8965C21.0379 10.8965 27.1064 16.9643 27.1064 24.4492C27.1064 31.934 21.0378 38.002 13.5527 38.002C6.06779 38.0018 9.32922e-05 31.9339 0 24.4492C0 16.9645 6.06773 10.8967 13.5527 10.8965ZM13.5527 14.751C8.19654 14.7512 3.85449 19.0932 3.85449 24.4492C3.85459 29.8052 8.1966 34.1473 13.5527 34.1475C18.909 34.1475 23.2519 29.8053 23.252 24.4492C23.252 19.0931 18.9091 14.751 13.5527 14.751Z" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0.581431" y1="12.4085" x2="24.7052" y2="31.2751" gradientUnits="userSpaceOnUse"><stop stop-color="#FF4000"/><stop offset="1" stop-color="#FE784B"/></linearGradient></defs></svg>`;

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F8F8;font-family:'Poppins',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F8F8;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#E0234E 0%,#FF4000 100%);padding:32px 40px;text-align:center;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding-bottom:12px;">${LOGO_SVG}</td></tr>
    <tr><td align="center" style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Ormeet</td></tr>
  </table>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px 40px 32px 40px;">
${body}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:0 40px 32px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="border-top:1px solid #EEEEEE;padding-top:24px;text-align:center;">
      <p style="margin:0 0 4px 0;font-size:12px;color:#4F4F4F;">&copy; ${new Date().getFullYear()} Ormeet. All rights reserved.</p>
      <p style="margin:0;font-size:11px;color:#BCBCBC;">This is an automated message. Please do not reply.</p>
    </td></tr>
  </table>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000000;line-height:1.3;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 24px 0;font-size:14px;color:#4F4F4F;line-height:1.5;">${text}</p>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;color:#434343;">Hi <strong style="color:#000000;">${name}</strong>,</p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:14px;color:#434343;line-height:1.6;">${text}</p>`;
}

function primaryButton(text: string, url: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center">
  <a href="${url}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E0234E 0%,#FF4000 100%);color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
    ${text}
  </a>
</td></tr>
</table>`;
}

function linkText(url: string): string {
  return `<p style="margin:0 0 16px 0;font-size:12px;color:#BCBCBC;word-break:break-all;">Or copy this link: <a href="${url}" style="color:#E0234E;">${url}</a></p>`;
}

function infoBox(content: string): string {
  return `<div style="background:#FFF4F3;border-left:4px solid #E0234E;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
${content}
</div>`;
}

function warningBox(content: string): string {
  return `<div style="background:#FFF9F8;border-left:4px solid #FF3425;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
${content}
</div>`;
}

function successBox(content: string): string {
  return `<div style="background:#EBF6EE;border-left:4px solid #34A853;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
${content}
</div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
<td style="padding:8px 0;font-size:13px;color:#4F4F4F;font-weight:600;width:140px;vertical-align:top;">${label}</td>
<td style="padding:8px 0;font-size:13px;color:#000000;">${value}</td>
</tr>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
${rows}
</table>`;
}

function signOff(): string {
  return `<p style="margin:24px 0 0 0;font-size:14px;color:#434343;">Best regards,<br><strong style="color:#E0234E;">The Ormeet Team</strong></p>`;
}

// ─── EXPORTED TEMPLATE BUILDERS ─────────────────────────────────────────────

export function welcomeEmailHtml(name: string, verificationUrl: string): string {
  return baseLayout('Welcome to Ormeet', `
    ${heading('Welcome to Ormeet!')}
    ${subheading('Your event journey starts here.')}
    ${greeting(name)}
    ${paragraph('Thank you for joining <strong>Ormeet</strong> — your all-in-one platform for discovering, creating, and managing events.')}
    ${paragraph('To get started, please verify your email address:')}
    ${primaryButton('Verify Email Address', verificationUrl)}
    ${linkText(verificationUrl)}
    ${infoBox(`
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#E0234E;">What you can do with Ormeet:</p>
      <p style="margin:0;font-size:13px;color:#434343;line-height:1.8;">
        🎫 Discover and book amazing events<br>
        🏢 Create and manage your own events<br>
        📍 Find venues near you<br>
        💳 Secure ticket purchasing<br>
        ⭐ Share reviews and ratings
      </p>
    `)}
    ${paragraph('If you didn\'t create this account, please ignore this email.')}
    ${signOff()}
  `);
}

export function verificationEmailHtml(name: string, verificationUrl: string): string {
  return baseLayout('Verify Your Email', `
    ${heading('Verify Your Email')}
    ${subheading('One quick step to activate your account.')}
    ${greeting(name)}
    ${paragraph('Please verify your email address to complete your registration on Ormeet.')}
    ${primaryButton('Verify Email Address', verificationUrl)}
    ${linkText(verificationUrl)}
    ${paragraph('<span style="color:#BCBCBC;font-size:12px;">This link will expire in 24 hours.</span>')}
    ${paragraph('If you didn\'t request this, please ignore this email.')}
    ${signOff()}
  `);
}

export function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return baseLayout('Reset Your Password', `
    ${heading('Reset Your Password')}
    ${subheading('We received a request to reset your password.')}
    ${greeting(name)}
    ${paragraph('Click the button below to choose a new password for your Ormeet account.')}
    ${primaryButton('Reset Password', resetUrl)}
    ${linkText(resetUrl)}
    ${warningBox(`
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#FF3425;">⚠️ Important</p>
      <p style="margin:0;font-size:13px;color:#434343;line-height:1.6;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support.</p>
    `)}
    ${paragraph('For security reasons, never share this link with anyone.')}
    ${signOff()}
  `);
}

export function passwordChangedEmailHtml(name: string, supportEmail: string): string {
  return baseLayout('Password Changed', `
    ${heading('Password Changed Successfully')}
    ${subheading('Your account password has been updated.')}
    ${greeting(name)}
    ${successBox(`
      <p style="margin:0;font-size:13px;color:#0F9335;font-weight:600;">✓ Your password was changed successfully.</p>
    `)}
    ${warningBox(`
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#FF3425;">🔐 Wasn't you?</p>
      <p style="margin:0;font-size:13px;color:#434343;line-height:1.6;">If you didn't make this change, contact our support team immediately at <a href="mailto:${supportEmail}" style="color:#E0234E;font-weight:600;">${supportEmail}</a></p>
    `)}
    ${paragraph('<strong>Security Tips:</strong>')}
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:13px;color:#434343;line-height:2;">
      <li>Never share your password with anyone</li>
      <li>Use a unique password for each account</li>
      <li>Enable two-factor authentication when available</li>
    </ul>
    ${signOff()}
  `);
}

export function loginNotificationEmailHtml(name: string, loginTime: string, ipAddress: string, userAgent: string): string {
  return baseLayout('New Login Detected', `
    ${heading('New Login Detected')}
    ${subheading('We noticed a new sign-in to your account.')}
    ${greeting(name)}
    ${infoBox(`
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#E0234E;">Login Details</p>
      ${detailTable(
        detailRow('Time', loginTime) +
        detailRow('IP Address', ipAddress) +
        detailRow('Device', userAgent)
      )}
    `)}
    ${paragraph('If this was you, you can safely ignore this email.')}
    ${warningBox(`
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#FF3425;">Not you?</p>
      <p style="margin:0;font-size:13px;color:#434343;line-height:1.6;">Change your password immediately and review your recent account activity.</p>
    `)}
    ${signOff()}
  `);
}

export function verificationCodeEmailHtml(code: string, purpose: string): string {
  const purposeLabels: Record<string, string> = {
    login: 'Login',
    registration: 'Registration',
    email_verification: 'Email Verification',
    phone_verification: 'Phone Verification',
    password_reset: 'Password Reset',
  };
  const purposeLabel = purposeLabels[purpose] || purpose;

  return baseLayout('Your Verification Code', `
    ${heading('Your Verification Code')}
    ${subheading(`For: ${purposeLabel}`)}
    ${paragraph('Use the code below to continue. It expires in <strong>10 minutes</strong>.')}
    <div style="background:#FFF4F3;border:2px dashed #E0234E;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 8px 0;font-size:12px;color:#4F4F4F;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
      <p style="margin:0;font-size:40px;font-weight:700;color:#E0234E;letter-spacing:10px;font-family:'Courier New',monospace;">${code}</p>
    </div>
    ${warningBox(`
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#FF3425;">⚠️ Security Notice</p>
      <ul style="margin:8px 0 0 0;padding-left:18px;font-size:12px;color:#434343;line-height:1.8;">
        <li>Never share this code with anyone</li>
        <li>Ormeet will never ask for your code</li>
        <li>Valid for 10 minutes only (3 attempts max)</li>
      </ul>
    `)}
    ${paragraph('If you didn\'t request this code, please ignore this email.')}
    ${signOff()}
  `);
}

export function orderConfirmationEmailHtml(orderData: {
  customerName: string;
  orderId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  tickets: Array<{ code: string; ticketType: string; price: number }>;
  subtotal: number;
  discount: number;
  serviceFee: number;
  processingFee: number;
  total: number;
  currency: string;
}): string {
  const ticketsHtml = orderData.tickets.map(t => `
    <div style="background:#FFF4F3;border-radius:8px;padding:16px 20px;margin-bottom:12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;font-weight:600;color:#000000;">${t.ticketType}</td>
          <td align="right" style="font-size:15px;font-weight:700;color:#E0234E;">${orderData.currency} ${t.price.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:8px;">
            <div style="background:#ffffff;border:1px dashed #E0234E;border-radius:6px;padding:8px;text-align:center;font-family:'Courier New',monospace;font-size:14px;letter-spacing:3px;font-weight:600;color:#434343;">${t.code}</div>
          </td>
        </tr>
      </table>
    </div>
  `).join('');

  const discountRow = orderData.discount > 0
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#34A853;">Discount</td><td align="right" style="padding:6px 0;font-size:13px;color:#34A853;">-${orderData.currency} ${orderData.discount.toFixed(2)}</td></tr>`
    : '';

  return baseLayout('Order Confirmation', `
    ${heading('Order Confirmed!')}
    ${subheading('Your tickets are ready.')}
    ${greeting(orderData.customerName)}
    ${successBox(`<p style="margin:0;font-size:14px;color:#0F9335;font-weight:600;">✓ Payment successful — your order is confirmed.</p>`)}

    ${infoBox(`
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#E0234E;">📅 ${orderData.eventTitle}</p>
      <p style="margin:4px 0;font-size:13px;color:#434343;">🗓️ ${orderData.eventDate}</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#434343;">📍 ${orderData.eventLocation}</p>
    `)}

    <p style="margin:20px 0 12px 0;font-size:15px;font-weight:600;color:#000000;">Your Tickets</p>
    ${ticketsHtml}

    <div style="background:#F8F8F8;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#000000;">Payment Summary</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:13px;color:#4F4F4F;">Subtotal</td><td align="right" style="padding:6px 0;font-size:13px;color:#000000;">${orderData.currency} ${orderData.subtotal.toFixed(2)}</td></tr>
        ${discountRow}
        <tr><td style="padding:6px 0;font-size:13px;color:#4F4F4F;">Service Fee</td><td align="right" style="padding:6px 0;font-size:13px;color:#000000;">${orderData.currency} ${orderData.serviceFee.toFixed(2)}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#4F4F4F;">Processing Fee</td><td align="right" style="padding:6px 0;font-size:13px;color:#000000;">${orderData.currency} ${orderData.processingFee.toFixed(2)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #EEEEEE;padding-top:10px;"></td></tr>
        <tr><td style="padding:6px 0;font-size:15px;font-weight:700;color:#000000;">Total</td><td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#E0234E;">${orderData.currency} ${orderData.total.toFixed(2)}</td></tr>
      </table>
    </div>

    <p style="margin:0;font-size:12px;color:#BCBCBC;">Order ID: ${orderData.orderId}</p>
    ${signOff()}
  `);
}

export function teamInviteEmailHtml(
  inviterName: string,
  organizationName: string,
  roleName: string,
  inviteCode: string,
  inviteUrl: string,
): string {
  return baseLayout(`You're Invited to ${organizationName}`, `
    ${heading("You're Invited!")}
    ${subheading(`Join ${organizationName} on Ormeet.`)}
    ${paragraph(`<strong style="color:#000000;">${inviterName}</strong> has invited you to join <strong style="color:#000000;">${organizationName}</strong> as a <strong style="color:#E0234E;">${roleName}</strong>.`)}

    ${infoBox(`
      ${detailTable(
        detailRow('Organization', organizationName) +
        detailRow('Role', roleName) +
        detailRow('Invite Code', `<code style="background:#FFF4F3;padding:2px 8px;border-radius:4px;color:#E0234E;font-weight:600;">${inviteCode}</code>`)
      )}
    `)}

    ${primaryButton('Accept Invitation', inviteUrl)}
    ${paragraph(`Or use invite code <strong style="color:#E0234E;">${inviteCode}</strong> when signing up.`)}
    ${paragraph('<span style="color:#BCBCBC;font-size:12px;">This invitation expires in 7 days.</span>')}
    ${signOff()}
  `);
}

export function eventReminderEmailHtml(reminderData: {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketCode?: string;
  ticketType?: string;
  hoursUntilEvent: number;
  frontendUrl: string;
}): string {
  const timeLabel = reminderData.hoursUntilEvent >= 24
    ? `${Math.round(reminderData.hoursUntilEvent / 24)} day(s)`
    : reminderData.hoursUntilEvent === 0
      ? 'now'
      : `${reminderData.hoursUntilEvent} hour(s)`;

  const ticketHtml = reminderData.ticketCode
    ? `<div style="background:#FFF4F3;border:2px dashed #E0234E;border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
        <p style="margin:0 0 4px 0;font-size:11px;color:#4F4F4F;text-transform:uppercase;letter-spacing:1px;">Your Ticket Code</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:#E0234E;letter-spacing:5px;font-family:'Courier New',monospace;">${reminderData.ticketCode}</p>
        ${reminderData.ticketType ? `<p style="margin:6px 0 0 0;font-size:12px;color:#4F4F4F;">${reminderData.ticketType}</p>` : ''}
      </div>`
    : '';

  return baseLayout('Event Reminder', `
    ${heading('Your Event is Coming Up!')}
    ${subheading(`Starting in ${timeLabel}`)}
    ${greeting(reminderData.attendeeName)}
    ${paragraph('This is a friendly reminder about your upcoming event.')}

    ${infoBox(`
      <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#E0234E;">📅 ${reminderData.eventTitle}</p>
      <p style="margin:4px 0;font-size:13px;color:#434343;">🗓️ ${reminderData.eventDate}</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#434343;">📍 ${reminderData.eventLocation}</p>
    `)}

    <div style="background:linear-gradient(135deg,#E0234E,#FF4000);border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">⏰ Starts in ${timeLabel}</p>
    </div>

    ${ticketHtml}

    <p style="margin:16px 0 8px 0;font-size:14px;font-weight:600;color:#000000;">Quick Checklist</p>
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:13px;color:#434343;line-height:2;">
      <li>Have your ticket ready (digital or printed)</li>
      <li>Check the event location and plan your route</li>
      <li>Arrive 15–30 minutes early for check-in</li>
      <li>Bring a valid ID if required</li>
    </ul>

    ${primaryButton('View Event Details', reminderData.frontendUrl)}
    ${paragraph('We hope you have an amazing time!')}
    ${signOff()}
  `);
}

export function checkInConfirmationEmailHtml(checkInData: {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketCode: string;
  ticketType: string;
  checkInTime: string;
  checkInMethod: string;
  seatInfo?: string;
  supportEmail: string;
}): string {
  const seatRow = checkInData.seatInfo ? detailRow('Seat', checkInData.seatInfo) : '';

  return baseLayout('Check-In Confirmed', `
    ${heading('Check-In Confirmed!')}
    ${subheading("You're all set — enjoy the event.")}
    ${greeting(checkInData.attendeeName)}

    ${successBox(`
      <p style="margin:0;font-size:14px;color:#0F9335;font-weight:600;">✓ You have successfully checked in.</p>
      <p style="margin:4px 0 0 0;font-size:12px;color:#4F4F4F;">Checked in at ${checkInData.checkInTime}</p>
    `)}

    ${infoBox(`
      <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#E0234E;">📅 ${checkInData.eventTitle}</p>
      <p style="margin:4px 0;font-size:13px;color:#434343;">🗓️ ${checkInData.eventDate}</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#434343;">📍 ${checkInData.eventLocation}</p>
    `)}

    <div style="background:#F8F8F8;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#000000;">Check-In Details</p>
      ${detailTable(
        detailRow('Ticket Code', `<code style="background:#FFF4F3;padding:2px 8px;border-radius:4px;color:#E0234E;font-weight:600;">${checkInData.ticketCode}</code>`) +
        detailRow('Ticket Type', checkInData.ticketType) +
        detailRow('Method', checkInData.checkInMethod.toUpperCase()) +
        seatRow
      )}
    </div>

    ${paragraph(`Need help? Contact us at <a href="mailto:${checkInData.supportEmail}" style="color:#E0234E;font-weight:600;">${checkInData.supportEmail}</a>`)}
    ${signOff()}
  `);
}
