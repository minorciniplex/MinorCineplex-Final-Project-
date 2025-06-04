import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, userId, bookingId, movieId } = req.body;
    const amountNumber = Number(amount);
    if (!amountNumber || isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'จำนวนเงินไม่ถูกต้อง' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNumber * 100), // แปลงเป็นสตางค์
      currency: 'thb',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId || '',
        bookingId: bookingId || '',
        movieId: movieId || '',
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntent: paymentIntent,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: err.message });
  }
} 