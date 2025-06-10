import webpush from 'web-push';

// Web Push configuration - only set if keys are available
const initializeWebPush = () => {
  try {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (vapidPublicKey && vapidPrivateKey && 
        vapidPublicKey !== 'your-vapid-public-key' && 
        vapidPrivateKey !== 'your-vapid-private-key') {
      
      webpush.setVapidDetails(
        'mailto:support@minorcineplex.com',
        vapidPublicKey,
        vapidPrivateKey
      );
      console.log('WebPush VAPID configured successfully');
      return true;
    } else {
      console.log('WebPush VAPID keys not configured, push notifications disabled');
      return false;
    }
  } catch (error) {
    console.error('Error initializing WebPush:', error);
    return false;
  }
};

// Initialize on module load
const webPushConfigured = initializeWebPush();

// Firebase Cloud Messaging configuration
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || 'your-fcm-server-key';

// Push notification payload templates
const getCancellationPushPayload = (bookingData) => {
  const {
    userName,
    movieTitle,
    bookingId,
    refundAmount,
    refundPercentage
  } = bookingData;

  return {
    title: '🎬 การยกเลิกการจองสำเร็จ',
    body: `คุณ${userName} ยกเลิกการจอง ${movieTitle} สำเร็จ คืนเงิน ${refundPercentage}% (THB ${refundAmount})`,
    icon: '/icons/cancel-notification.png',
    badge: '/icons/badge-icon.png',
    image: '/icons/cancellation-banner.png',
    data: {
      type: 'cancellation',
      bookingId: bookingId,
      url: '/dashboard/cancellation-history',
      timestamp: new Date().toISOString()
    },
    actions: [
      {
        action: 'view_details',
        title: 'ดูรายละเอียด',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'ปิด',
        icon: '/icons/close-icon.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };
};

const getBookingConfirmationPushPayload = (bookingData) => {
  const {
    userName,
    movieTitle,
    cinemaName,
    showtimeDate,
    showtimeTime,
    bookingId,
    totalAmount
  } = bookingData;

  return {
    title: '🎉 จองตั๋วหนังสำเร็จ!',
    body: `คุณ${userName} จองหนัง ${movieTitle} ที่ ${cinemaName} เรียบร้อยแล้ว`,
    icon: '/icons/booking-success.png',
    badge: '/icons/badge-icon.png',
    image: '/icons/booking-banner.png',
    data: {
      type: 'booking_confirmation',
      bookingId: bookingId,
      url: '/dashboard/booking-history',
      timestamp: new Date().toISOString(),
      showtime: `${showtimeDate} ${showtimeTime}`,
      totalAmount: totalAmount
    },
    actions: [
      {
        action: 'view_ticket',
        title: 'ดูตั๋ว',
        icon: '/icons/ticket-icon.png'
      },
      {
        action: 'add_calendar',
        title: 'เพิ่มในปฏิทิน',
        icon: '/icons/calendar-icon.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  };
};

// Web Push functions
export const sendWebPushNotification = async (subscription, payload) => {
  try {
    if (!webPushConfigured) {
      console.log('WebPush not configured, skipping push notification');
      return {
        success: false,
        error: 'WebPush not configured',
        message: 'Push notifications are disabled - VAPID keys not set'
      };
    }

    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    
    console.log('Web push notification sent successfully');
    return {
      success: true,
      statusCode: result.statusCode,
      message: 'Web push notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending web push notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send web push notification'
    };
  }
};

export const sendCancellationPushNotification = async (userSubscriptions, bookingData) => {
  try {
    const payload = getCancellationPushPayload(bookingData);
    const results = [];

    // Send to all user's subscriptions (multiple devices)
    for (const subscription of userSubscriptions) {
      try {
        const result = await sendWebPushNotification(subscription, payload);
        results.push({
          subscriptionId: subscription.id,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message
        });
      }
    }

    console.log('Cancellation push notifications sent:', results.length);
    return {
      success: true,
      results: results,
      message: `Push notifications sent to ${results.length} devices`
    };
  } catch (error) {
    console.error('Error sending cancellation push notifications:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send push notifications'
    };
  }
};

export const sendBookingConfirmationPushNotification = async (userSubscriptions, bookingData) => {
  try {
    const payload = getBookingConfirmationPushPayload(bookingData);
    const results = [];

    for (const subscription of userSubscriptions) {
      try {
        const result = await sendWebPushNotification(subscription, payload);
        results.push({
          subscriptionId: subscription.id,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message
        });
      }
    }

    console.log('Booking confirmation push notifications sent:', results.length);
    return {
      success: true,
      results: results,
      message: `Push notifications sent to ${results.length} devices`
    };
  } catch (error) {
    console.error('Error sending booking confirmation push notifications:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send push notifications'
    };
  }
};

// FCM (Firebase Cloud Messaging) functions
export const sendFCMNotification = async (fcmTokens, payload) => {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.image
      },
      data: payload.data,
      tokens: fcmTokens
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('FCM notification sent successfully:', result);
      return {
        success: true,
        result: result,
        message: 'FCM notification sent successfully'
      };
    } else {
      throw new Error(`FCM request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send FCM notification'
    };
  }
};

// Utility functions
export const generateVapidKeys = () => {
  return webpush.generateVAPIDKeys();
};

export const validatePushSubscription = (subscription) => {
  return subscription && 
         subscription.endpoint && 
         subscription.keys && 
         subscription.keys.p256dh && 
         subscription.keys.auth;
};

// In-app notification functions (for when user is active on the site)
export const sendInAppNotification = async (userId, notificationData) => {
  try {
    // This would typically use WebSockets or Server-Sent Events
    // For now, we'll log and return success
    console.log(`Sending in-app notification to user ${userId}:`, notificationData);
    
    return {
      success: true,
      message: 'In-app notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send in-app notification'
    };
  }
};

export default {
  sendWebPushNotification,
  sendCancellationPushNotification,
  sendBookingConfirmationPushNotification,
  sendFCMNotification,
  sendInAppNotification,
  generateVapidKeys,
  validatePushSubscription
}; 