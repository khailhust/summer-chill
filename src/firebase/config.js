import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, enableLogging } from "firebase/database";

// TODO: Thay thế bằng Firebase config của bạn
// 1. Vào Firebase Console -> Add project
// 2. Chọn Web App (</>) -> Copy config object vào đây
// 3. Trong Firebase Console -> Build -> Realtime Database -> Create Database -> Start in test mode
// 4. Trong Firebase Console -> Build -> Authentication -> Get Started -> Anonymous -> Enable
const firebaseConfig = {
  apiKey: "AIzaSyD36zY0HUPQ7-V12_aUn3ku-b9sAW5-1rw",
  authDomain: "summer-chill-2026-7dd04.firebaseapp.com",
  projectId: "summer-chill-2026-7dd04",
  storageBucket: "summer-chill-2026-7dd04.firebasestorage.app",
  messagingSenderId: "142510570889",
  appId: "1:142510570889:web:4d73a9019d7cb1a965b558",
  databaseURL: "https://summer-chill-2026-7dd04-default-rtdb.asia-southeast1.firebasedatabase.app" // Assuming Singapore region
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Firebase Realtime Database tự động có offline capabilities trên Web.
// Khi mất mạng, nó sẽ đọc/ghi vào cache nội bộ.
// Khi có mạng lại, nó sẽ tự đồng bộ với server.

export { app, auth, database };
