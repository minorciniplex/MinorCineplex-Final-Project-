import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chargeId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(chargeId);

    res.status(200).json({
      status: paymentIntent.status,
    });
  } catch (err) {
    console.error('Error checking promptpay status:', err);
    res.status(500).json({ error: err.message });
  }
} 