import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, firstName, lastName, orderId, status, orderDetails } = await request.json();

        if (!email || !firstName || !lastName || !orderId || !status || !orderDetails) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const statusMessages = {
            pending: 'Your order is currently being processed.',
            processing: 'Great news! We\'re now preparing your order.',
            shipped: 'Your order has been shipped and is on its way!',
            delivered: 'Your order has been successfully delivered.',
            cancelled: 'Your order has been cancelled.',
        };

        const statusMessage = statusMessages[status.toLowerCase() as keyof typeof statusMessages] ||
            `Your order status has been updated to: ${status}`;

        // Calculate totals
        const originalTotal = orderDetails.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
        let discountedTotal = originalTotal;
        let discountAmount = 0;

        if (orderDetails.discount) {
            if (orderDetails.discount.type === "percentage") {
                discountedTotal = originalTotal * (1 - orderDetails.discount.value / 100);
                discountAmount = originalTotal - discountedTotal;
            } else if (orderDetails.discount.type === "fixed_amount") {
                discountedTotal = Math.max(0, originalTotal - orderDetails.discount.value);
                discountAmount = orderDetails.discount.value;
            }
        }

        const finalTotal = Math.round(discountedTotal);

        // Generate product rows HTML
        const productRowsHtml = orderDetails.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px 10px; vertical-align: top;">
            <div style="display: flex; align-items: center;">
                ${item.product.imageUrl ? `
                <img src="${item.product.imageUrl}" alt="${item.product.title}" 
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                ` : ''}
                <div style="margin-left: 12px; margin-top: 12px">
                <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${item.product.title}</div>
                <div style="color: #666; font-size: 14px;">Qty: ${item.quantity}</div>
                </div>
            </div>
            </td>
            <td style="padding: 15px 10px; text-align: right; font-weight: 500;">
            ₦${item.subtotal.toLocaleString()}
            </td>
        </tr>
        `).join('');

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address
                pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
            },
        });

        const mailOptions = {
            from: `"${process.env.STORE_NAME || 'Your Store'}" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Order Update - #${orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background-color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin: 0 0 10px 0; font-size: 28px;">Order Status Update</h1>
            <p style="color: #666; margin: 0; font-size: 16px;">Hi ${firstName} ${lastName}, your order has been updated!</p>
          </div>

          <!-- Status Update -->
          <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <h2 style="margin: 0 0 10px 0; color: #007bff; font-size: 20px;">Order #${orderId}</h2>
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Status: ${status.toUpperCase()}</p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">${statusMessage}</p>
            </div>
          </div>

          <!-- Order Items -->
          <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 15px 10px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 15px 10px; text-align: right; font-weight: 600; color: #333; border-bottom: 2px solid #dee2e6;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Order Summary</h3>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Subtotal:</span>
                <span style="font-weight: 500;">₦${originalTotal.toLocaleString()}</span>
              </div>
              ${orderDetails.discount ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #e74c3c;">
                  <span>Discount (${orderDetails.discount.code}):</span>
                  <span>-₦${discountAmount.toLocaleString()}</span>
                </div>
              ` : ''}
              ${orderDetails.shippingCost ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Shipping:</span>
                  <span style="font-weight: 500;">₦${orderDetails.shippingCost.toLocaleString()}</span>
                </div>
              ` : ''}
              <hr style="border: none; border-top: 2px solid #dee2e6; margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #333;">
                <span>Total:</span>
                <span style="color: #28a745;">₦${(finalTotal + (orderDetails.shippingCost || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Info -->
          ${orderDetails.address ? `
            <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Shipping Address</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                ${orderDetails.address}<br>
                ${orderDetails.city}, ${orderDetails.state} ${orderDetails.postalCode}<br>
                ${orderDetails.country}
              </p>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="background-color: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">If you have any questions about your order, please don't hesitate to contact us.</p>
            <p style="margin: 0; color: #333; font-weight: 600; font-size: 16px;">Thank you for your business! 🎉</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message regarding your order status update.
            </p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        console.log('Email sent successfully via Nodemailer');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}