import Omise from 'omise';

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount } = req.body; // amount หน่วยเป็นสตางค์ เช่น 29900 = 299 บาท

  try {
    const charge = await omise.charges.create({
      amount,
      currency: 'thb',
      source: { type: 'promptpay' },
      return_uri: 'https://yourdomain.com/payment-success', // เปลี่ยนเป็น url ของคุณ
    });

    res.status(200).json({
      qr: charge.source.scannable_code.image.download_uri,
      chargeId: charge.id,
      status: charge.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 