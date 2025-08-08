import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBtmNNWYOo2Ei_tBDn2FNjTEA93rVg6LlU",
  authDomain: "buddkit-40bb2.firebaseapp.com",
  projectId: "buddkit-40bb2",
  storageBucket: "buddkit-40bb2.firebasestorage.app",
  messagingSenderId: "1073730325267",
  appId: "1:1073730325267:web:b08aa144950c40e7af68e6",
  measurementId: "G-9349WR6Q6W"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging };