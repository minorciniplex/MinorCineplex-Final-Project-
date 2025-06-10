import { sendCancellationEmail } from './emailService';
import { sendCancellationSMS, validatePhoneNumber } from './smsService';
import { sendCancellationPushNotification, sendInAppNotification } from './pushNotificationService';

// Main notification service that orchestrates all notification types
export class NotificationService {
  constructor() {
    this.emailEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'false';
    this.smsEnabled = process.env.SMS_NOTIFICATIONS_ENABLED !== 'false';
    this.pushEnabled = process.env.PUSH_NOTIFICATIONS_ENABLED !== 'false';
  }

  // Send all types of cancellation notifications
  async sendCancellationNotifications(userData, bookingData, options = {}) {
    const results = {
      email: { enabled: false },
      sms: { enabled: false },
      push: { enabled: false },
      summary: {
        totalSent: 0,
        totalFailed: 0,
        errors: []
      }
    };

    try {
      console.log('Sending cancellation notifications for booking:', bookingData.bookingId);

      // Prepare notification data
      const notificationPayload = {
        userName: userData.name || userData.email?.split('@')[0] || 'ผู้ใช้',
        userEmail: userData.email,
        userPhone: userData.phone,
        movieTitle: bookingData.movieTitle,
        cinemaName: bookingData.cinemaName,
        showtimeDate: bookingData.showtimeDate,
        showtimeTime: bookingData.showtimeTime,
        originalAmount: bookingData.originalAmount,
        refundAmount: bookingData.refundAmount,
        refundPercentage: bookingData.refundPercentage,
        cancellationReason: bookingData.cancellationReason,
        cancellationDate: bookingData.cancellationDate,
        bookingId: bookingData.bookingId
      };

      // Send Email Notification
      if (this.emailEnabled && userData.email && options.sendEmail !== false) {
        results.email.enabled = true;
        try {
          console.log('Sending cancellation email to:', userData.email);
          const emailResult = await sendCancellationEmail(userData.email, notificationPayload);
          results.email = { ...results.email, ...emailResult };
          
          if (emailResult.success) {
            results.summary.totalSent++;
          } else {
            results.summary.totalFailed++;
            results.summary.errors.push(`Email: ${emailResult.error}`);
          }
        } catch (error) {
          results.email = {
            enabled: true,
            success: false,
            error: error.message
          };
          results.summary.totalFailed++;
          results.summary.errors.push(`Email: ${error.message}`);
        }
      }

      // Send SMS Notification
      if (this.smsEnabled && userData.phone && options.sendSMS !== false) {
        results.sms.enabled = true;
        try {
          if (validatePhoneNumber(userData.phone)) {
            console.log('Sending cancellation SMS to:', userData.phone);
            const smsResult = await sendCancellationSMS(userData.phone, notificationPayload);
            results.sms = { ...results.sms, ...smsResult };
            
            if (smsResult.success) {
              results.summary.totalSent++;
            } else {
              results.summary.totalFailed++;
              results.summary.errors.push(`SMS: ${smsResult.error}`);
            }
          } else {
            results.sms = {
              enabled: true,
              success: false,
              error: 'Invalid phone number format'
            };
            results.summary.totalFailed++;
            results.summary.errors.push('SMS: Invalid phone number format');
          }
        } catch (error) {
          results.sms = {
            enabled: true,
            success: false,
            error: error.message
          };
          results.summary.totalFailed++;
          results.summary.errors.push(`SMS: ${error.message}`);
        }
      }

      // Send Push Notification
      if (this.pushEnabled && userData.pushSubscriptions && options.sendPush !== false) {
        results.push.enabled = true;
        try {
          console.log('Sending cancellation push notifications to', userData.pushSubscriptions.length, 'devices');
          const pushResult = await sendCancellationPushNotification(userData.pushSubscriptions, notificationPayload);
          results.push = { ...results.push, ...pushResult };
          
          if (pushResult.success) {
            results.summary.totalSent++;
          } else {
            results.summary.totalFailed++;
            results.summary.errors.push(`Push: ${pushResult.error}`);
          }
        } catch (error) {
          results.push = {
            enabled: true,
            success: false,
            error: error.message
          };
          results.summary.totalFailed++;
          results.summary.errors.push(`Push: ${error.message}`);
        }
      }

      // Send In-App Notification (if user is currently online)
      if (options.sendInApp !== false) {
        try {
          const inAppResult = await sendInAppNotification(userData.id, {
            type: 'cancellation',
            title: 'การยกเลิกการจองสำเร็จ',
            message: `การยกเลิกการจอง ${notificationPayload.movieTitle} เสร็จสิ้น คืนเงิน THB ${notificationPayload.refundAmount}`,
            data: notificationPayload
          });
          
          if (inAppResult.success) {
            results.summary.totalSent++;
          }
        } catch (error) {
          console.error('Error sending in-app notification:', error);
        }
      }

      console.log('Notification results:', results.summary);
      return results;

    } catch (error) {
      console.error('Error in sendCancellationNotifications:', error);
      results.summary.errors.push(`General: ${error.message}`);
      return results;
    }
  }

  // Send booking confirmation notifications
  async sendBookingConfirmationNotifications(userData, bookingData, options = {}) {
    const results = {
      email: { enabled: false },
      sms: { enabled: false },
      push: { enabled: false },
      summary: {
        totalSent: 0,
        totalFailed: 0,
        errors: []
      }
    };

    try {
      console.log('Sending booking confirmation notifications for booking:', bookingData.bookingId);

      // Implementation for booking confirmation
      // Similar structure to cancellation notifications
      // This would be used when a new booking is created

      return results;
    } catch (error) {
      console.error('Error in sendBookingConfirmationNotifications:', error);
      results.summary.errors.push(`General: ${error.message}`);
      return results;
    }
  }

  // Get notification preferences for a user
  async getUserNotificationPreferences(userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      // Default preferences if none found
      return data || {
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        booking_reminders: true,
        cancellation_notifications: true
      };
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      // Return default preferences on error
      return {
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        booking_reminders: true,
        cancellation_notifications: true
      };
    }
  }

  // Update notification preferences
  async updateUserNotificationPreferences(userId, preferences, supabase) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('User notification preferences updated successfully');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating user notification preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if notifications should be sent based on user preferences
  shouldSendNotification(preferences, notificationType) {
    switch (notificationType) {
      case 'email':
        return preferences.email_notifications && preferences.cancellation_notifications;
      case 'sms':
        return preferences.sms_notifications && preferences.cancellation_notifications;
      case 'push':
        return preferences.push_notifications && preferences.cancellation_notifications;
      default:
        return true;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export individual functions for direct use
export const sendCancellationNotifications = (userData, bookingData, options) => 
  notificationService.sendCancellationNotifications(userData, bookingData, options);

export const sendBookingConfirmationNotifications = (userData, bookingData, options) => 
  notificationService.sendBookingConfirmationNotifications(userData, bookingData, options);

export const getUserNotificationPreferences = (userId, supabase) => 
  notificationService.getUserNotificationPreferences(userId, supabase);

export const updateUserNotificationPreferences = (userId, preferences, supabase) => 
  notificationService.updateUserNotificationPreferences(userId, preferences, supabase);

export default notificationService; 