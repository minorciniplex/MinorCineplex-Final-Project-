import Omise from 'omise';

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY,
  omiseVersion: '2019-05-29',
});

export default async function handler(req, res) {
  const { chargeId } = req.query;
  if (!chargeId) return res.status(400).json({ error: 'Missing chargeId' });
  try {
    const charge = await omise.charges.retrieve(chargeId);
    res.status(200).json({ status: charge.status });
  } catch (err) {
    console.error('Error getting QR status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 