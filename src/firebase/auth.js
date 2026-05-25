import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
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
    console.warn("Lỗi đăng nhập Google Popup:", error.code);
    
    // Nếu lỗi do trình duyệt/Adblock chặn Popup hoặc lỗi mạng cross-origin
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/network-request-failed' || 
        error.code === 'auth/internal-error' || 
        error.code === 'auth/cancelled-popup-request') {
      
      console.log("Đang thử lại bằng phương thức Redirect...");
      // Gọi signInWithRedirect (sẽ tải lại toàn bộ trang chuyển hướng sang Google)
      signInWithRedirect(auth, googleProvider);
      return null;
    }
    
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

// Xử lý kết quả đăng nhập sau khi redirect về
getRedirectResult(auth).then(async (result) => {
  if (result && result.user) {
    const user = result.user;
    const name = user.displayName || 'Thành viên';
    const avatar = user.photoURL || '👤';
    const email = user.email || '';
    await updateUserProfile(name, avatar, email);
    console.log("Đã cập nhật profile sau khi redirect thành công.");
  }
}).catch(error => {
  console.error("Lỗi getRedirectResult:", error);
});
