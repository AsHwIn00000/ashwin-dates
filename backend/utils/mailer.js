const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp, purpose) => {
  const user = process.env.SMTP_USER || 'ashwindatesanddryfruits@gmail.com';
  const pass = process.env.SMTP_PASS;

  const purposeText = purpose === 'forgot-password' ? 'Resetting your password' : 'Logging in to your account';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px;">🌴</span>
        <h2 style="color: #6b21a8; margin-top: 8px; margin-bottom: 4px; font-weight: 800; font-size: 24px;">Ashwin Dates & Dry Fruits</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Premium Dates, Dry Fruits, Seeds & Spices</p>
      </div>
      
      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-bottom: 24px;">
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">Hello,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          We received a request for <strong>${purposeText}</strong>. Please use the following One-Time Password (OTP) to verify your request. This code is valid for 10 minutes.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: #f3e8ff; border: 2px dashed #a855f7; border-radius: 12px; padding: 12px 36px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7e22ce;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #dc2626; font-size: 13px; font-weight: 500; margin: 0 0 24px 0; text-align: center;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
      
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} Ashwin Dates & Dry Fruits. All rights reserved.</p>
        <p style="margin: 0;">Contact: +91 9442114559 | ashwindatesanddryfruits@gmail.com</p>
      </div>
    </div>
  `;

  if (!pass) {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ SIMULATED EMAIL SERVICE (NO SMTP PASSWORD CONFIGURED) ⚡');
    console.log(`TO:      ${email}`);
    console.log(`SUBJECT: Ashwin Dates & Dry Fruits - OTP Code`);
    console.log(`PURPOSE: ${purposeText}`);
    console.log(`OTP:     [ ${otp} ]`);
    console.log('='.repeat(60) + '\n');
    return { simulated: true, otp };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"Ashwin Dates & Dry Fruits" <${user}>`,
    to: email,
    subject: `Your OTP Code: ${otp}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  return { simulated: false };
};

module.exports = { sendOtpEmail };
