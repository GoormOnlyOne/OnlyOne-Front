import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase/config";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export class FCMService {
  private static tokenRegistered = false;
  private static currentToken: string | null = null;

  static async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      // 이미 토큰이 있으면 재사용
      if (this.currentToken) {
        return this.currentToken;
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn("Notification permission denied");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log("FCM registration token obtained:", token.substring(0, 20) + "...");
        this.currentToken = token;
        return token;
      } else {
        console.warn("No registration token available");
        return null;
      }
    } catch (error) {
      console.error("An error occurred while retrieving token:", error);
      return null;
    }
  }

  static setupMessageListener(onMessageCallback: (payload: any) => void) {
    return onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      onMessageCallback(payload);
    });
  }

  static async sendTokenToServer(token: string, userId: number): Promise<boolean> {
    try {
      // 이미 이 토큰으로 등록했으면 스킵
      if (this.tokenRegistered && this.currentToken === token) {
        console.log("FCM token already registered, skipping");
        return true;
      }

      const { updateFcmToken } = await import('../api/notification');
      const response = await updateFcmToken(userId, token);
      
      // 새로운 CommonResponse 구조에 맞춰 success 필드 확인
      if (response?.success === true) {
        this.tokenRegistered = true;
        console.log("FCM token successfully registered to server");
        return true;
      } else {
        console.warn("Failed to register FCM token:", response);
        return false;
      }
    } catch (error) {
      console.error("Failed to send token to server:", error);
      return false;
    }
  }
}

export default FCMService;