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
    console.error('SMTP_PASS not configured. OTP for debugging (server-side only): [', otp, ']');
    throw new Error('SMTP not configured. Cannot send OTP email.');
  }

  // Strip spaces from Gmail App Password (Render env vars may store them with spaces)
  const cleanPass = pass.replace(/\s+/g, '');

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: { user, pass: cleanPass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"Ashwin Dates & Dry Fruits" <${user}>`,
      to: email,
      subject: `Your OTP Code: ${otp}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { simulated: false };
  } catch (err) {
    console.error('Nodemailer sendMail failed. OTP for debugging (server-side only): [', otp, ']', err.message);
    throw err;
  }
};

const sendOrderNotificationToAdmin = async (order, shippingAddress, orderProducts) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'ashwindatesanddryfruits@gmail.com';
  const senderUser = process.env.SMTP_USER || 'ashwindatesanddryfruits@gmail.com';
  const pass = process.env.SMTP_PASS;

  const itemsHtml = orderProducts.map(p => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 10px; color: #334155; font-size: 14px;"><strong>${p.name}</strong> (${p.weight || '500g'})</td>
      <td style="padding: 10px; color: #64748b; font-size: 14px; text-align: center;">${p.quantity}</td>
      <td style="padding: 10px; color: #334155; font-size: 14px; text-align: right; font-weight: 600;">₹${p.price * p.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #3d6b35, #6b4226); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800;">🛒 New Customer Order Alert!</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Order ID: ${order._id}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #3d6b35; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Customer Details</h3>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Name:</strong> ${shippingAddress.name}</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Shipping Address:</strong> ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #3d6b35; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px 10px; text-align: left;">Item</th>
              <th style="padding: 8px 10px; text-align: center;">Qty</th>
              <th style="padding: 8px 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: right;">
          <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Subtotal: ₹${order.itemsPrice || (order.totalAmount - (order.shippingPrice || 0))}</p>
          <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Shipping Fee: ₹${order.shippingPrice || 0}</p>
          <p style="margin: 8px 0 0 0; color: #3d6b35; font-size: 18px; font-weight: 800;">Grand Total: ₹${order.totalAmount}</p>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="color: #64748b; font-size: 13px; margin-bottom: 12px;">Please process and confirm this order in the admin portal.</p>
        <a href="http://localhost:5173/admin/orders" style="display: inline-block; background: #3d6b35; color: #ffffff; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 14px;">Open Admin Dashboard</a>
      </div>
    </div>
  `;

  if (!pass) {
    console.log('\n' + '='.repeat(70));
    console.log('🔔 [NEW ORDER ADMIN NOTIFICATION] (SIMULATED - NO SMTP PASSWORD CONFIGURED)');
    console.log(`TO ADMIN: ${adminEmail}`);
    console.log(`ORDER ID: ${order._id}`);
    console.log(`CUSTOMER: ${shippingAddress.name} (${shippingAddress.phone})`);
    console.log(`ITEMS:    ${orderProducts.map(p => `${p.name} x${p.quantity}`).join(', ')}`);
    console.log(`TOTAL:    ₹${order.totalAmount} (${order.paymentMethod.toUpperCase()})`);
    console.log('=' .repeat(70) + '\n');
    return { simulated: true };
  }

  const cleanPass = pass ? pass.replace(/\s+/g, '') : pass;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: senderUser, pass: cleanPass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Ashwin Dates Store" <${senderUser}>`,
      to: adminEmail,
      subject: `🚨 New Order #${order._id.toString().slice(-6)} Received - ₹${order.totalAmount}`,
      html: htmlContent,
    });
    console.log(`✅ Admin email notification sent for Order #${order._id}`);
  } catch (err) {
    console.error('Failed to send admin order email notification:', err.message);
  }
};

const sendOrderConfirmationToCustomer = async (order, customerEmail, shippingAddress, orderProducts) => {
  const senderUser = process.env.SMTP_USER || 'ashwindatesanddryfruits@gmail.com';
  const pass = process.env.SMTP_PASS;

  const itemsHtml = orderProducts.map(p => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 10px; color: #334155; font-size: 14px;"><strong>${p.name}</strong> (${p.weight || '500g'})</td>
      <td style="padding: 10px; color: #64748b; font-size: 14px; text-align: center;">${p.quantity}</td>
      <td style="padding: 10px; color: #334155; font-size: 14px; text-align: right; font-weight: 600;">₹${p.price * p.quantity}</td>
    </tr>
  `).join('');

  const displayId = order.orderNumber || (`ORD-${order._id.toString().slice(-6).toUpperCase()}`);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #3d6b35, #5a582e); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;">
        <span style="font-size: 36px;">🎉</span>
        <h2 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800;">Thank You for Your Order!</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Order Reference: <strong>${displayId}</strong></p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>${shippingAddress.name}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">We have received your order and are preparing it with care. Here is your order summary:</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #3d6b35; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px 10px; text-align: left;">Item</th>
              <th style="padding: 8px 10px; text-align: center;">Qty</th>
              <th style="padding: 8px 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: right;">
          <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Subtotal: ₹${order.itemsPrice || (order.totalAmount - (order.shippingPrice || 0))}</p>
          <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Shipping Fee: ₹${order.shippingPrice || 0}</p>
          <p style="margin: 8px 0 0 0; color: #3d6b35; font-size: 18px; font-weight: 800;">Total Paid/Due: ₹${order.totalAmount}</p>
        </div>
      </div>

      <div style="margin-bottom: 24px; background: #fdfdfd; border: 1px solid #f1f5f9; padding: 16px; border-radius: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">Shipping To:</h4>
        <p style="margin: 2px 0; color: #64748b; font-size: 13px;">${shippingAddress.street}, ${shippingAddress.city}</p>
        <p style="margin: 2px 0; color: #64748b; font-size: 13px;">${shippingAddress.state} - ${shippingAddress.pincode}</p>
        <p style="margin: 2px 0; color: #64748b; font-size: 13px;">Phone: ${shippingAddress.phone}</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0 0 4px 0;">Need help? Contact support at +91 9442114559 or ashwindatesanddryfruits@gmail.com</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Ashwin Dates & Dry Fruits</p>
      </div>
    </div>
  `;

  if (!pass) {
    console.log('\n' + '='.repeat(70));
    console.log('✉️ [CUSTOMER ORDER RECEIPT] (SIMULATED MODE)');
    console.log(`TO CUSTOMER: ${customerEmail}`);
    console.log(`ORDER ID:    ${displayId}`);
    console.log(`TOTAL:       ₹${order.totalAmount}`);
    console.log('=' .repeat(70) + '\n');
    return { simulated: true };
  }

  const cleanPass = pass ? pass.replace(/\s+/g, '') : pass;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: senderUser, pass: cleanPass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Ashwin Dates & Dry Fruits" <${senderUser}>`,
      to: customerEmail,
      subject: `Order Confirmed! Reference: ${displayId}`,
      html: htmlContent,
    });
    console.log(`✅ Customer order receipt sent to ${customerEmail}`);
  } catch (err) {
    console.error('Failed to send customer order email:', err.message);
  }
};

const sendOrderStatusUpdateToCustomer = async (order, customerEmail, newStatus) => {
  if (!customerEmail) return;
  const senderUser = process.env.SMTP_USER || 'ashwindatesanddryfruits@gmail.com';
  const pass = process.env.SMTP_PASS;

  const displayId = order.orderNumber || (`ORD-${order._id.toString().slice(-6).toUpperCase()}`);
  const statusUpper = newStatus.toUpperCase();

  let statusEmoji = '📦';
  let messageText = `Your order status has been updated to <strong>${statusUpper}</strong>.`;

  if (newStatus === 'shipped') {
    statusEmoji = '🚚';
    messageText = `Great news! Your order <strong>${displayId}</strong> has been shipped and is on its way to you.`;
  } else if (newStatus === 'delivered') {
    statusEmoji = '✅';
    messageText = `Your order <strong>${displayId}</strong> has been delivered! We hope you enjoy your premium dates and dry fruits.`;
  } else if (newStatus === 'cancelled') {
    statusEmoji = '❌';
    messageText = `Your order <strong>${displayId}</strong> has been cancelled.`;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">${statusEmoji}</span>
        <h2 style="color: #3d6b35; margin-top: 8px; margin-bottom: 4px; font-weight: 800;">Order Status Update</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Order Reference: <strong>${displayId}</strong></p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-bottom: 20px; text-align: center;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          ${messageText}
        </p>
        <div style="display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; padding: 8px 24px; color: #166534; font-weight: 700; font-size: 14px;">
          Status: ${statusUpper}
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0 0 4px 0;">Ashwin Dates & Dry Fruits | Support: +91 9442114559</p>
      </div>
    </div>
  `;

  if (!pass) {
    console.log(`🔔 [CUSTOMER STATUS UPDATE] Order ${displayId} -> ${statusUpper} (SIMULATED MODE)`);
    return { simulated: true };
  }

  const cleanPass = pass ? pass.replace(/\s+/g, '') : pass;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: senderUser, pass: cleanPass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Ashwin Dates Store" <${senderUser}>`,
      to: customerEmail,
      subject: `Order Update: ${displayId} is now ${statusUpper}`,
      html: htmlContent,
    });
    console.log(`✅ Status update email sent to ${customerEmail}`);
  } catch (err) {
    console.error('Failed to send status update email:', err.message);
  }
};

module.exports = { sendOtpEmail, sendOrderNotificationToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdateToCustomer };
