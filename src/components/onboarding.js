import { loginWithGoogle, updateUserProfile } from "../firebase/auth.js";
import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

export function showOnboarding() {
  const content = `
    <div style="text-align: center; padding: var(--space-4) 0;">
      <p style="color: var(--text-secondary); margin-bottom: var(--space-6);">
        Hãy đăng nhập bằng tài khoản Google của bạn để tham gia chuyến đi. Điều này giúp chúng tôi nhận diện bạn chính xác trên mọi thiết bị!
      </p>
      
      <button id="btn-google-login" class="btn btn-primary" style="width: 100%; padding: var(--space-3); font-size: var(--fs-lg); display: flex; align-items: center; justify-content: center; gap: var(--space-3);">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style="width: 24px; height: 24px; background: white; border-radius: 50%; padding: 2px;" />
        Đăng nhập bằng Google
      </button>
    </div>
  `;

  // Define a custom logic to bypass the standard confirm button of the modal
  setTimeout(() => {
    const btn = document.getElementById('btn-google-login');
    if (btn) {
      btn.addEventListener('click', async () => {
        // Show loading state
        btn.innerHTML = 'Đang đăng nhập...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
          const user = await loginWithGoogle();
          
          // Trình duyệt đang chuyển hướng, không làm gì thêm để tránh báo lỗi
          if (!user) return;
          
          // Lấy name và avatar từ Google Profile
          const name = user.displayName || 'Thành viên';
          // Sử dụng ảnh đại diện Google
          const avatar = user.photoURL || '👤';
          const email = user.email || '';
          
          await updateUserProfile(name, avatar, email);
          
          showToast(`Chào mừng ${name}!`, 'success');
          closeModal();
        } catch (error) {
          console.error(error);
          if (error.message === 'ADBLOCK_DETECTED') {
            showToast('Vui lòng tắt các Trình chặn quảng cáo/Chặn theo dõi để có thể đăng nhập!', 'error');
          } else {
            showToast('Đăng nhập thất bại. Vui lòng thử lại!', 'error');
          }
          // Reset button state
          btn.innerHTML = `
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style="width: 24px; height: 24px; background: white; border-radius: 50%; padding: 2px;" />
            Đăng nhập bằng Google
          `;
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      });
    }
  }, 100);

  // We hide the default confirm button since we use our custom Google button
  openModal('Tham gia chuyến đi', content, async () => {
    showToast('Vui lòng bấm nút Đăng nhập bằng Google', 'error');
    return false;
  }, 'Đóng', () => {
    // onCancel callback: redirect back to home page if not logged in
    window.location.hash = '#/';
    return true;
  });
}
