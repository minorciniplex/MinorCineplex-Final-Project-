import Omise from 'omise';

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { chargeId } = req.body;
  try {
    const charge = await omise.charges.retrieve(chargeId);
    res.status(200).json({ status: charge.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 