import Omise from 'omise';

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY,
  omiseVersion: '2019-05-29',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;
    const charge = await omise.charges.create({
      amount: amount,
      currency: 'thb',
      source: { type: 'promptpay' },
    });
    res.status(200).json({
      qr: charge.source.scannable_code.image.download_uri,
      chargeId: charge.id,
      status: charge.status,
    });
  } catch (err) {
    console.error('Error creating promptpay:', err);
    res.status(500).json({ error: err.message });
  }
} 