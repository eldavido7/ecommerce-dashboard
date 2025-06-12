// File: /api/paystack/webhook/route.ts
import type { NextRequest } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_default_key";

// Add GET method to test endpoint accessibility
export async function GET() {
    console.log("Webhook endpoint GET request received - endpoint is accessible");
    return new Response(JSON.stringify({
        message: "Webhook endpoint is working",
        timestamp: new Date().toISOString(),
        methods: ["GET", "POST"]
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function POST(request: NextRequest) {
    console.log("=== PAYSTACK WEBHOOK RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());

    try {
        const rawBody = await request.text();
        console.log("Webhook raw body:", rawBody);

        // Verify webhook signature
        const signature = request.headers.get("x-paystack-signature");
        if (!signature) {
            console.error("Missing Paystack signature");
            return new Response("Missing signature", { status: 400 });
        }

        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(rawBody)
            .digest("hex");

        console.log("Signature verification:", {
            received: signature,
            computed: hash,
            match: hash === signature
        });

        if (hash !== signature) {
            console.error("Invalid Paystack signature");
            return new Response("Invalid signature", { status: 400 });
        }

        const event = JSON.parse(rawBody);
        console.log("Parsed webhook event:", JSON.stringify(event, null, 2));

        // Handle charge.success event
        if (event.event === "charge.success") {
            console.log("Processing charge.success event");

            const { metadata, reference, amount, status } = event.data;

            console.log("Event data:", {
                reference,
                amount,
                status,
                metadata: JSON.stringify(metadata, null, 2)
            });

            // Validate payment status
            if (status !== "success") {
                console.error("Payment not successful:", status);
                return new Response("Payment not successful", { status: 400 });
            }

            // Validate metadata structure
            if (!metadata) {
                console.error("No metadata found in webhook data");
                return new Response("No metadata", { status: 400 });
            }

            // Check required metadata fields
            const requiredFields = ['customer', 'items', 'shippingOptionId', 'subtotal', 'total'];
            const missingFields = requiredFields.filter(field => !metadata[field]);

            if (missingFields.length > 0) {
                console.error("Missing required metadata fields:", missingFields);
                console.error("Available metadata keys:", Object.keys(metadata));
                return new Response(`Missing metadata fields: ${missingFields.join(', ')}`, { status: 400 });
            }

            // Validate customer data
            const customerRequiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
            const missingCustomerFields = customerRequiredFields.filter(field => !metadata.customer[field]);

            if (missingCustomerFields.length > 0) {
                console.error("Missing customer fields:", missingCustomerFields);
                console.error("Available customer keys:", Object.keys(metadata.customer));
                return new Response(`Missing customer fields: ${missingCustomerFields.join(', ')}`, { status: 400 });
            }

            // Validate items array
            if (!Array.isArray(metadata.items) || metadata.items.length === 0) {
                console.error("Invalid items array:", metadata.items);
                return new Response("Invalid items array", { status: 400 });
            }

            // Prepare order data for /api/orders
            const orderData = {
                firstName: metadata.customer.firstName,
                lastName: metadata.customer.lastName,
                email: metadata.customer.email,
                phone: metadata.customer.phone,
                address: metadata.customer.address,
                city: metadata.customer.city,
                state: metadata.customer.state,
                postalCode: metadata.customer.postalCode,
                country: metadata.customer.country,
                subtotal: metadata.subtotal,
                total: metadata.total,
                shippingCost: metadata.shippingCost || 0,
                discountAmount: metadata.discountAmount || 0,
                shippingOptionId: metadata.shippingOptionId,
                discountId: metadata.discountId || null,
                paymentReference: reference,
                paymentAmount: amount,
                items: metadata.items.map((item: { productId: string; quantity: number; price: number }) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            console.log("Prepared order data:", JSON.stringify(orderData, null, 2));

            // Get the base URL for the API call
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000');

            const apiUrl = `${baseUrl}/api/orders`;
            console.log("Making request to orders API:", apiUrl);

            // Send POST request to /api/orders
            try {
                const orderRes = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Paystack-Webhook/1.0"
                    },
                    body: JSON.stringify(orderData),
                });

                console.log("Order API response status:", orderRes.status);

                const responseText = await orderRes.text();
                console.log("Order API response body:", responseText);

                if (!orderRes.ok) {
                    let errorData;
                    try {
                        errorData = JSON.parse(responseText);
                    } catch {
                        errorData = { message: responseText };
                    }

                    console.error("Failed to create order:", {
                        status: orderRes.status,
                        statusText: orderRes.statusText,
                        error: errorData
                    });
                    return new Response(`Failed to create order: ${errorData.message || responseText}`, { status: 500 });
                }

                let order;
                try {
                    order = JSON.parse(responseText);
                } catch {
                    order = { message: "Order created successfully" };
                }

                console.log("Order created successfully via webhook:", order);
                return new Response("Webhook processed successfully", { status: 200 });

            } catch (fetchError) {
                console.error("Fetch error when calling orders API:", fetchError);
                return new Response(`Order API request failed: ${fetchError}`, { status: 500 });
            }
        }

        console.log("Event not handled:", event.event, "- webhook will return 200");
        return new Response("Event not handled", { status: 200 });

    } catch (error) {
        console.error("Webhook processing error:", error);
        if (error instanceof SyntaxError) {
            return new Response("Invalid JSON in webhook body", { status: 400 });
        }
        return new Response(`Webhook error: ${error}`, { status: 500 });
    }
}