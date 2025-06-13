// Refund Service for handling automatic refunds
// Supports multiple payment gateways: Stripe, Omise, PayPal

// Payment Gateway configurations
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Refund status constants
export const REFUND_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Payment method constants
export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  OMISE: 'omise',
  PAYPAL: 'paypal',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet'
};

// Main Refund Service Class
export class RefundService {
  constructor() {
    this.stripeConfigured = !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'your-stripe-secret-key';
    this.omiseConfigured = !!OMISE_SECRET_KEY && OMISE_SECRET_KEY !== 'your-omise-secret-key'; 
    this.paypalConfigured = !!PAYPAL_CLIENT_ID && !!PAYPAL_CLIENT_SECRET;
  }

  // Main function to process refund based on payment method
  async processRefund(refundData) {
    try {
      const {
        bookingId,
        paymentMethod,
        paymentId, 
        refundAmount,
        refundReason,
        originalAmount,
        userId
      } = refundData;

      // Validate refund data
      const validation = this.validateRefundData(refundData);
      if (!validation.valid) {
        throw new Error(`Invalid refund data: ${validation.errors.join(', ')}`);
      }

      // Route to appropriate payment gateway
      let refundResult;
      switch (paymentMethod.toLowerCase()) {
        case PAYMENT_METHODS.STRIPE:
          refundResult = await this.processStripeRefund(paymentId, refundAmount, refundReason);
          break;
          
        case PAYMENT_METHODS.OMISE:
          refundResult = await this.processOmiseRefund(paymentId, refundAmount, refundReason);
          break;
          
        case PAYMENT_METHODS.PAYPAL:
          refundResult = await this.processPayPalRefund(paymentId, refundAmount, refundReason);
          break;
          
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Update database with refund result
      const dbResult = await this.updateRefundRecord({
        bookingId,
        refundResult,
        paymentMethod,
        userId
      });

      return {
        success: true,
        refundId: refundResult.refundId,
        status: refundResult.status,
        message: 'Refund processed successfully',
        estimatedDays: this.getEstimatedRefundDays(paymentMethod),
        refundAmount: refundAmount,
        dbResult: dbResult
      };

    } catch (error) {
      console.error('Error processing refund');
      
      // Update database with failure
      await this.updateRefundRecord({
        bookingId: refundData.bookingId,
        refundResult: {
          status: REFUND_STATUS.FAILED,
          error: 'Refund processing failed'
        },
        paymentMethod: refundData.paymentMethod,
        userId: refundData.userId
      });

      return {
        success: false,
        error: 'Failed to process refund',
        message: 'Failed to process refund'
      };
    }
  }

  // Stripe refund processing
  async processStripeRefund(paymentIntentId, amount, reason) {
    try {
      if (!this.stripeConfigured) {
        throw new Error('Stripe not configured');
      }

      // Import Stripe only when needed
      const stripe = (await import('stripe')).default(STRIPE_SECRET_KEY);
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason || 'requested_by_customer',
        metadata: {
          source: 'minor_cineplex_cancellation',
          timestamp: new Date().toISOString()
        }
      });

      return {
        refundId: refund.id,
        status: this.mapStripeStatus(refund.status),
        gatewayResponse: refund,
        estimatedArrival: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)) // 5 days
      };

    } catch (error) {
      console.error('Stripe refund error');
      throw new Error('Stripe refund failed');
    }
  }

  // Omise refund processing
  async processOmiseRefund(chargeId, amount, reason) {
    try {
      if (!this.omiseConfigured) {
        throw new Error('Omise not configured');
      }

      // Import Omise only when needed
      const omise = (await import('omise')).default({
        secretKey: OMISE_SECRET_KEY
      });

      const refund = await omise.charges.refund(chargeId, {
        amount: Math.round(amount * 100), // Convert to satangs (Thai cent)
        metadata: {
          reason: reason,
          source: 'minor_cineplex_cancellation',
          timestamp: new Date().toISOString()
        }
      });

      return {
        refundId: refund.id,
        status: this.mapOmiseStatus(refund.status),
        gatewayResponse: refund,
        estimatedArrival: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)) // 3 days
      };

    } catch (error) {
      console.error('Omise refund error');
      throw new Error('Omise refund failed');
    }
  }

  // PayPal refund processing
  async processPayPalRefund(captureId, amount, reason) {
    try {
      if (!this.paypalConfigured) {
        throw new Error('PayPal not configured');
      }

      // Get PayPal access token
      const accessToken = await this.getPayPalAccessToken();
      
      const refundData = {
        amount: {
          currency_code: 'THB',
          value: amount.toFixed(2)
        },
        note_to_payer: reason || 'Minor Cineplex booking cancellation refund'
      };

      const response = await fetch(`https://api.paypal.com/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `refund-${Date.now()}`, // Idempotency key
        },
        body: JSON.stringify(refundData)
      });

      const refund = await response.json();

      if (!response.ok) {
        throw new Error(`PayPal API error: ${refund.message}`);
      }

      return {
        refundId: refund.id,
        status: this.mapPayPalStatus(refund.status),
        gatewayResponse: refund,
        estimatedArrival: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      };

    } catch (error) {
      console.error('PayPal refund error');
      throw new Error('PayPal refund failed');
    }
  }

  // Get PayPal access token
  async getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://api.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal token error: ${data.error_description}`);
    }

    return data.access_token;
  }

  // Update refund record in database
  async updateRefundRecord({ bookingId, refundResult, paymentMethod, userId }) {
    try {
      // This would be called with Supabase client from the API
      // Return structure for API to use
      return {
        shouldUpdate: true,
        updateData: {
          refund_status: refundResult.status,
          refund_id: refundResult.refundId,
          refund_processed_date: new Date().toISOString(),
          estimated_refund_date: refundResult.estimatedArrival,
          gateway_response: JSON.stringify(refundResult.gatewayResponse),
          refund_method: paymentMethod,
          updated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error updating refund record');
      throw error;
    }
  }

  // Validate refund data
  validateRefundData(data) {
    const errors = [];
    
    if (!data.bookingId) errors.push('Booking ID required');
    if (!data.paymentMethod) errors.push('Payment method required');
    if (!data.paymentId) errors.push('Payment ID required');
    if (!data.refundAmount || data.refundAmount <= 0) errors.push('Valid refund amount required');
    if (!data.originalAmount || data.originalAmount <= 0) errors.push('Valid original amount required');
    if (data.refundAmount > data.originalAmount) errors.push('Refund amount cannot exceed original amount');
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // Map gateway statuses to our standard statuses
  mapStripeStatus(stripeStatus) {
    const statusMap = {
      'pending': REFUND_STATUS.PROCESSING,
      'succeeded': REFUND_STATUS.COMPLETED,
      'failed': REFUND_STATUS.FAILED,
      'canceled': REFUND_STATUS.CANCELLED
    };
    return statusMap[stripeStatus] || REFUND_STATUS.PENDING;
  }

  mapOmiseStatus(omiseStatus) {
    const statusMap = {
      'pending': REFUND_STATUS.PROCESSING,
      'succeeded': REFUND_STATUS.COMPLETED,
      'failed': REFUND_STATUS.FAILED
    };
    return statusMap[omiseStatus] || REFUND_STATUS.PENDING;
  }

  mapPayPalStatus(paypalStatus) {
    const statusMap = {
      'COMPLETED': REFUND_STATUS.COMPLETED,
      'PENDING': REFUND_STATUS.PROCESSING,
      'FAILED': REFUND_STATUS.FAILED,
      'CANCELLED': REFUND_STATUS.CANCELLED
    };
    return statusMap[paypalStatus] || REFUND_STATUS.PENDING;
  }

  // Get estimated refund days by payment method
  getEstimatedRefundDays(paymentMethod) {
    const daysMap = {
      [PAYMENT_METHODS.STRIPE]: '3-5 วันทำการ',
      [PAYMENT_METHODS.OMISE]: '2-3 วันทำการ', 
      [PAYMENT_METHODS.PAYPAL]: '5-7 วันทำการ'
    };
    return daysMap[paymentMethod.toLowerCase()] || '3-7 วันทำการ';
  }

  // Check service availability
  getServiceStatus() {
    return {
      stripe: {
        configured: this.stripeConfigured,
        available: this.stripeConfigured
      },
      omise: {
        configured: this.omiseConfigured,
        available: this.omiseConfigured
      },
      paypal: {
        configured: this.paypalConfigured,
        available: this.paypalConfigured
      }
    };
  }
}

// Export singleton instance
export const refundService = new RefundService();

// Export utility functions
export const processBookingRefund = async (refundData) => {
  return await refundService.processRefund(refundData);
};

export const getRefundServiceStatus = () => {
  return refundService.getServiceStatus();
};

export default refundService; 