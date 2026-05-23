import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { ref, set, serverTimestamp, onDisconnect } from "firebase/database";
import { auth, database } from "./config.js";

const googleProvider = new GoogleAuthProvider();

/**
 * Theo dõi trạng thái đăng nhập
 * @param {function} callback Hàm callback nhận vào user object hoặc null
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Đăng nhập bằng Google
 */
export async function loginWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  }
}

/**
 * Đăng xuất
 */
export async function logoutGoogle() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
}

/**
 * Lấy user hiện tại
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Khởi tạo/Cập nhật profile user và lưu vào Realtime Database
 */
export async function updateUserProfile(name, avatar, email) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập");

  // Update profile của auth
  await updateProfile(user, {
    displayName: name,
    photoURL: avatar
  });

  // Lưu thông tin vào database members/
  const memberRef = ref(database, `members/${user.uid}`);
  await set(memberRef, {
    name: name,
    avatar: avatar,
    email: email || user.email || '',
    joinedAt: serverTimestamp(),
    isOnline: true
  });
  
  // Thiết lập trạng thái offline khi ngắt kết nối
  onDisconnect(memberRef).update({ isOnline: false });
}
