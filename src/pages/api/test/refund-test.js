// Test API for refund gateway functionality
import { refundService } from "@/services/refundService";

const handler = async (req, res) => {
  console.log("Refund test API called");
  console.log("Request body:", req.body);

  if (req.method === "POST") {
    const { gateway, testMode = true } = req.body;

    if (!gateway) {
      return res.status(400).json({
        success: false,
        error: "Gateway is required",
        message: "Please specify which gateway to test"
      });
    }

    try {
      // Get service status first
      const serviceStatus = refundService.getServiceStatus();
      
      if (!serviceStatus[gateway]?.configured) {
        return res.status(400).json({
          success: false,
          error: `${gateway} is not configured`,
          message: `Please configure ${gateway.toUpperCase()} environment variables first`,
          configRequired: getConfigRequirements(gateway)
        });
      }

      // Test basic configuration
      const testResult = await testGatewayConfiguration(gateway, testMode);

      return res.status(200).json({
        success: true,
        message: `${gateway.toUpperCase()} test completed`,
        data: {
          gateway: gateway,
          testMode: testMode,
          configured: true,
          testResult: testResult,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error(`Error testing ${gateway}:`, error);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to test ${gateway.toUpperCase()}`,
        details: {
          gateway: gateway,
          errorType: error.name,
          timestamp: new Date().toISOString()
        }
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

// Test gateway configuration
const testGatewayConfiguration = async (gateway, testMode) => {
  try {
    switch (gateway.toLowerCase()) {
      case 'stripe':
        return await testStripeConfig(testMode);
      case 'omise':
        return await testOmiseConfig(testMode);
      case 'paypal':
        return await testPayPalConfig(testMode);
      default:
        throw new Error(`Unsupported gateway: ${gateway}`);
    }
  } catch (error) {
    throw new Error(`Gateway test failed: ${error.message}`);
  }
};

// Test Stripe configuration
const testStripeConfig = async (testMode) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Import Stripe only when testing
    const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
    
    // Test API connection by fetching account info
    const account = await stripe.account.retrieve();
    
    return {
      status: 'success',
      message: 'Stripe connection successful',
      accountId: account.id,
      country: account.country,
      currency: account.default_currency,
      testMode: account.livemode === false,
      capabilities: Object.keys(account.capabilities || {}),
      connectionTime: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Stripe test failed: ${error.message}`);
  }
};

// Test Omise configuration
const testOmiseConfig = async (testMode) => {
  try {
    if (!process.env.OMISE_SECRET_KEY) {
      throw new Error('OMISE_SECRET_KEY not configured');
    }

    // Import Omise only when testing
    const omise = (await import('omise')).default({
      secretKey: process.env.OMISE_SECRET_KEY
    });
    
    // Test API connection by fetching account info
    const account = await omise.account.retrieve();
    
    return {
      status: 'success',
      message: 'Omise connection successful',
      accountId: account.id,
      email: account.email,
      currency: account.currency,
      country: account.country,
      connectionTime: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Omise test failed: ${error.message}`);
  }
};

// Test PayPal configuration
const testPayPalConfig = async (testMode) => {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    // Test PayPal OAuth token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const baseURL = process.env.PAYPAL_ENVIRONMENT === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
    
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal API error: ${data.error_description || data.error}`);
    }

    return {
      status: 'success',
      message: 'PayPal connection successful',
      environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
      tokenType: data.token_type,
      scope: data.scope,
      expiresIn: data.expires_in,
      connectionTime: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`PayPal test failed: ${error.message}`);
  }
};

// Get configuration requirements for each gateway
const getConfigRequirements = (gateway) => {
  const requirements = {
    stripe: {
      required: ['STRIPE_SECRET_KEY'],
      optional: ['STRIPE_WEBHOOK_SECRET'],
      instructions: [
        '1. ไปที่ https://stripe.com และสร้างบัญชี',
        '2. ไปที่ Developers > API Keys',
        '3. คัดลอก Secret Key (sk_test_xxx)',
        '4. เพิ่มใน .env.local: STRIPE_SECRET_KEY=sk_test_xxx'
      ]
    },
    omise: {
      required: ['OMISE_SECRET_KEY'],
      optional: ['OMISE_WEBHOOK_SECRET'],
      instructions: [
        '1. ไปที่ https://omise.co และสร้างบัญชี',
        '2. ไปที่ Settings > Keys',
        '3. คัดลอก Secret Key (skey_test_xxx)',
        '4. เพิ่มใน .env.local: OMISE_SECRET_KEY=skey_test_xxx'
      ]
    },
    paypal: {
      required: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
      optional: ['PAYPAL_ENVIRONMENT'],
      instructions: [
        '1. ไปที่ https://developer.paypal.com และสร้างบัญชี',
        '2. สร้าง App ใหม่',
        '3. คัดลอก Client ID และ Client Secret',
        '4. เพิ่มใน .env.local: PAYPAL_CLIENT_ID=xxx, PAYPAL_CLIENT_SECRET=xxx'
      ]
    }
  };

  return requirements[gateway.toLowerCase()] || {
    required: [],
    optional: [],
    instructions: ['Unknown gateway configuration']
  };
};

export default handler; 