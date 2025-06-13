// Test API for checking refund service status and configuration
import { getRefundServiceStatus } from "@/services/refundService";

const handler = async (req, res) => {
  console.log("Refund status test API called");

  if (req.method === "GET") {
    try {
      // Get service status
      const serviceStatus = getRefundServiceStatus();
      
      // Check environment variables
      const envCheck = {
        stripe: {
          secretKey: !!process.env.STRIPE_SECRET_KEY,
          webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
          configured: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your-stripe-secret-key'
        },
        omise: {
          secretKey: !!process.env.OMISE_SECRET_KEY,
          webhookSecret: !!process.env.OMISE_WEBHOOK_SECRET,
          configured: !!process.env.OMISE_SECRET_KEY && process.env.OMISE_SECRET_KEY !== 'your-omise-secret-key'
        },
        paypal: {
          clientId: !!process.env.PAYPAL_CLIENT_ID,
          clientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
          environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
          configured: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET
        }
      };

      // Test basic functionality
      const functionalityTest = {
        refundServiceImport: true,
        statusFunction: typeof getRefundServiceStatus === 'function',
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: "Refund service status check completed",
        data: {
          serviceStatus,
          environmentCheck: envCheck,
          functionalityTest,
          recommendations: generateRecommendations(envCheck),
          nextSteps: getNextSteps(envCheck)
        }
      });

    } catch (error) {
      console.error("Error checking refund service status:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: "Failed to check refund service status"
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

// Generate recommendations based on configuration
const generateRecommendations = (envCheck) => {
  const recommendations = [];

  if (!envCheck.stripe.configured && !envCheck.omise.configured && !envCheck.paypal.configured) {
    recommendations.push({
      priority: "HIGH",
      message: "ไม่มี Payment Gateway ใดที่ตั้งค่าแล้ว - แนะนำให้เริ่มต้นด้วย Stripe",
      action: "ตั้งค่า STRIPE_SECRET_KEY ใน environment variables"
    });
  }

  if (envCheck.stripe.secretKey && !envCheck.stripe.webhookSecret) {
    recommendations.push({
      priority: "MEDIUM", 
      message: "Stripe ตั้งค่าแล้วแต่ขาด Webhook Secret",
      action: "เพิ่ม STRIPE_WEBHOOK_SECRET สำหรับ webhook verification"
    });
  }

  if (envCheck.paypal.configured && envCheck.paypal.environment === 'sandbox') {
    recommendations.push({
      priority: "LOW",
      message: "PayPal อยู่ใน Sandbox Mode",
      action: "เปลี่ยนเป็น 'live' เมื่อพร้อม production"
    });
  }

  return recommendations;
};

// Get next steps based on configuration
const getNextSteps = (envCheck) => {
  const steps = [];

  if (!envCheck.stripe.configured && !envCheck.omise.configured && !envCheck.paypal.configured) {
    steps.push("1. เลือก Payment Gateway (แนะนำ Stripe)");
    steps.push("2. สร้างบัญชีและรับ API Keys");
    steps.push("3. เพิ่ม Environment Variables");
    steps.push("4. ทดสอบการคืนเงิน");
  } else {
    if (envCheck.stripe.configured) {
      steps.push("✅ Stripe พร้อมใช้งาน");
      if (!envCheck.stripe.webhookSecret) {
        steps.push("⚠️ ตั้งค่า Stripe Webhook");
      }
    }
    
    if (envCheck.omise.configured) {
      steps.push("✅ Omise พร้อมใช้งาน");
    }
    
    if (envCheck.paypal.configured) {
      steps.push("✅ PayPal พร้อมใช้งาน");
    }
    
    steps.push("🚀 ทดสอบการคืนเงินจริง");
  }

  return steps;
};

export default handler; 