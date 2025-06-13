// Webhook API for handling refund status updates from payment gateways
// Supports Stripe, Omise, and PayPal webhooks

import { createSupabaseServerClient } from "@/utils/supabaseCookie";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { provider } = req.query; // stripe, omise, or paypal
    const rawBody = req.body;

    // Route to appropriate webhook handler
    switch (provider) {
      case 'stripe':
        return await handleStripeWebhook(req, res, rawBody);
      case 'omise':
        return await handleOmiseWebhook(req, res, rawBody);
      case 'paypal':
        return await handlePayPalWebhook(req, res, rawBody);
      default:
        return res.status(400).json({ error: "Unknown webhook provider" });
    }

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ 
      error: "Webhook processing failed"
    });
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req, res, rawBody) => {
  try {
    const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle refund events
    if (event.type === 'refund.updated') {
      const refund = event.data.object;
      await updateRefundStatus({
        refundId: refund.id,
        status: mapStripeStatus(refund.status),
        gatewayData: refund
      });
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({ error: 'Stripe webhook processing failed' });
  }
};

// Omise webhook handler
const handleOmiseWebhook = async (req, res, rawBody) => {
  try {
    const payload = rawBody;
    
    // Handle refund events
    if (payload.key === 'refund.update') {
      const refund = payload.data;
      await updateRefundStatus({
        refundId: refund.id,
        status: mapOmiseStatus(refund.status),
        gatewayData: refund
      });
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Omise webhook error:', error);
    return res.status(500).json({ error: 'Omise webhook processing failed' });
  }
};

// PayPal webhook handler
const handlePayPalWebhook = async (req, res, rawBody) => {
  try {
    const payload = rawBody;
    
    // Handle refund events
    if (payload.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      const refund = payload.resource;
      await updateRefundStatus({
        refundId: refund.id,
        status: mapPayPalStatus(refund.status),
        gatewayData: refund
      });
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return res.status(500).json({ error: 'PayPal webhook processing failed' });
  }
};

// Update refund status in database
const updateRefundStatus = async ({ refundId, status, gatewayData }) => {
  try {
    const supabase = createSupabaseServerClient();

    // Find cancellation record by refund_id
    const { data: cancellation, error: findError } = await supabase
      .from('booking_cancellations')
      .select('*')
      .eq('refund_id', refundId)
      .single();

    if (findError || !cancellation) {
      console.error('Cancellation not found for refund ID:', refundId);
      return;
    }

    // Update refund status
    const updateData = {
      refund_status: status,
      gateway_response: JSON.stringify(gatewayData),
      updated_at: new Date().toISOString()
    };

    // Add completion date if refund is completed
    if (status === 'completed') {
      updateData.refund_completed_date = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('booking_cancellations')
      .update(updateData)
      .eq('cancellation_id', cancellation.cancellation_id);

    if (updateError) {
      console.error('Error updating refund status:', updateError);
      return;
    }

    // Send notification if refund completed
    if (status === 'completed') {
      await sendRefundCompletedNotification(cancellation);
    }

  } catch (error) {
    console.error('Error updating refund status:', error);
  }
};

// Send notification when refund is completed
const sendRefundCompletedNotification = async (cancellation) => {
  try {
    // Get user details
    const supabase = createSupabaseServerClient();
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('user_id', cancellation.user_id)
      .single();

    if (userData && userData.email) {
      // Send email notification
      const { sendRefundCompletedEmail } = await import('@/services/emailService');
      
      await sendRefundCompletedEmail(userData.email, {
        userName: userData.name,
        bookingId: cancellation.booking_id,
        refundId: cancellation.refund_id,
        refundAmount: cancellation.refund_amount
      });
    }

  } catch (error) {
    console.error('Error sending refund completed notification:', error);
  }
};

// Status mapping functions
const mapStripeStatus = (stripeStatus) => {
  const statusMap = {
    'pending': 'processing',
    'succeeded': 'completed',
    'failed': 'failed',
    'canceled': 'cancelled'
  };
  return statusMap[stripeStatus] || 'pending';
};

const mapOmiseStatus = (omiseStatus) => {
  const statusMap = {
    'pending': 'processing',
    'succeeded': 'completed',
    'failed': 'failed'
  };
  return statusMap[omiseStatus] || 'pending';
};

const mapPayPalStatus = (paypalStatus) => {
  const statusMap = {
    'COMPLETED': 'completed',
    'PENDING': 'processing',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled'
  };
  return statusMap[paypalStatus] || 'pending';
};

export default handler;

// Disable body parsing for webhooks (we need raw body)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 