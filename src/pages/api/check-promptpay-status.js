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
    const { chargeId } = req.body;

    if (!chargeId) {
      return res.status(400).json({ error: 'Missing chargeId' });
    }

    const charge = await omise.charges.retrieve(chargeId);
    
    res.status(200).json({
      status: charge.status,
      charge: charge,
    });
  } catch (err) {
    console.error('Error checking promptpay status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 