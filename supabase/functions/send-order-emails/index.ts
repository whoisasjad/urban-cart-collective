
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails, customerEmail } = await req.json();
    
    // Validate required data
    if (!orderDetails || !customerEmail) {
      throw new Error("Missing required order information");
    }

    const adminEmail = "lynixdevs@gmail.com"; // Replace with your actual admin email
    
    // Format date
    const orderDate = new Date(orderDetails.created_at);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // Format items for the email
    const itemsList = orderDetails.items.map(item => 
      `${item.product.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity} - $${(item.price / 100).toFixed(2)}`
    ).join('<br>');

    // Format address for the email
    const address = orderDetails.shipping_address;
    const formattedAddress = `
      ${address.firstName} ${address.lastName}<br>
      ${address.address}<br>
      ${address.city}, ${address.state} ${address.postalCode}<br>
      ${address.country}<br>
      Phone: ${address.phone}
    `;

    // Format payment method
    const paymentMethod = orderDetails.payment_method === 'cash_on_delivery' 
      ? 'Cash on Delivery'
      : orderDetails.payment_method === 'bank_transfer'
      ? 'Bank Transfer'
      : 'Credit Card';

    // Send email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Urban Threads <orders@asjad.co>", // Update with your verified domain
      to: [customerEmail],
      subject: `Order Confirmed! #${orderDetails.id.substring(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #5856d6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p>Dear ${address.firstName},</p>
            <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> ${orderDetails.id.substring(0, 8)}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Total:</strong> $${(orderDetails.total / 100).toFixed(2)}</p>
            </div>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Items</h2>
              ${itemsList}
            </div>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Shipping Address</h2>
              ${formattedAddress}
            </div>
            
            <p>If you have any questions about your order, please don't hesitate to contact our customer service team.</p>
            <p>Thank you for shopping with Urban Threads!</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Urban Threads. All rights reserved.</p>
            <p>123 Fashion Street, New York, NY 10001</p>
          </div>
        </div>
      `
    });

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Urban Threads <orders@asjad.co>", // Update with your verified domain
      to: [adminEmail],
      subject: `New Order: #${orderDetails.id.substring(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #5856d6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Order Received!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p>A new order has been placed on the Urban Threads store.</p>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> ${orderDetails.id.substring(0, 8)}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Customer:</strong> ${address.firstName} ${address.lastName} (${customerEmail})</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Total:</strong> $${(orderDetails.total / 100).toFixed(2)}</p>
            </div>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Items</h2>
              ${itemsList}
            </div>
            
            <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h2 style="color: #5856d6; margin-top: 0;">Shipping Address</h2>
              ${formattedAddress}
            </div>
            
            <p>Please process this order as soon as possible.</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Urban Threads. All rights reserved.</p>
            <p>Admin Portal</p>
          </div>
        </div>
      `
    });

    console.log("Customer email sent:", customerEmailResponse);
    console.log("Admin email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        customer: customerEmailResponse,
        admin: adminEmailResponse
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error sending order emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
