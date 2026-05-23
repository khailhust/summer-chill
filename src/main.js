import { onAuthStateChange, getCurrentUser, logoutGoogle } from "./firebase/auth.js";
import { setupPresence, onMembersChange } from "./firebase/database.js";
import { renderNavbar } from "./components/navbar.js";
import { showToast } from "./components/toast.js";
import { openModal, closeModal } from "./components/modal.js";
import { showOnboarding } from "./components/onboarding.js";
import { renderLandingPage } from "./pages/landing.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderMusicPlayer } from "./components/music-player.js";
import { ADMIN_EMAILS } from "./utils/constants.js";
import "./components/members.js";

// Import CSS để Vite quản lý (Hot Reload)
import "./styles/index.css";
import "./styles/components.css";
import "./styles/animations.css";
import "./styles/landing.css";
import "./styles/dashboard.css";

// Import Alpine
import Alpine from "alpinejs";

// Đưa ra global để có thể gọi từ Alpine / HTML onclick
window.Alpine = Alpine;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.showOnboarding = showOnboarding;

// Hàm hỗ trợ render avatar (Emoji hoặc Ảnh Google)
window.renderAvatarHtml = function(avatarStr) {
  if (!avatarStr) return '👤';
  if (avatarStr.startsWith('http')) {
    return `<img src="${avatarStr}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" referrerpolicy="no-referrer" />`;
  }
  return avatarStr;
};

document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    route: window.location.hash || '#/',
    user: null,
    isAdmin: false,
    members: {},
    isOnline: navigator.onLine,
    
    init() {
      window.addEventListener('hashchange', () => {
        this.route = window.location.hash || '#/';
        this.checkAuthAndRoute();
        setTimeout(() => window.setupScrollAnimations(), 100);
      });

      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);

      onAuthStateChange((user) => {
        this.user = user;
        if (user) {
          // Kích hoạt Admin nếu email nằm trong danh sách
          if (user.email && ADMIN_EMAILS.includes(user.email)) {
            this.isAdmin = true;
          } else {
            this.isAdmin = false;
          }
          setupPresence();
        } else {
          this.isAdmin = false;
          this.checkAuthAndRoute();
        }
      });

      onMembersChange((data) => {
        this.members = data;

        // Cơ chế Kick out: Nếu user đang đăng nhập nhưng bị Admin xoá khỏi danh sách
        if (this.user && !this.isAdmin && Object.keys(data).length > 0) {
          if (!data[this.user.uid]) {
            logoutGoogle().then(() => {
              showToast('Bạn đã bị quản trị viên xoá khỏi nhóm', 'error');
              window.location.hash = '#/';
            });
          }
        }
      });
      
      window.addEventListener('show-onboarding', () => showOnboarding());
    },

    checkAuthAndRoute() {
      if (!this.user && this.isDashboard) {
        window.dispatchEvent(new CustomEvent('show-onboarding'));
      }
    },

    get isDashboard() {
      return this.route.startsWith('#/dashboard');
    }
  });
});

// Render UI dựa trên Alpine state
const appContainer = document.getElementById('app');

function renderApp() {
  appContainer.innerHTML = `
    <div x-data>
      <!-- Navbar -->
      <div id="navbar-mount"></div>

      <!-- Landing Page -->
      <div x-show="$store.app.route === '#/'" x-transition.opacity>
        <div id="landing-mount"></div>
      </div>

      <!-- Dashboard Page -->
      <div x-show="$store.app.isDashboard" x-transition.opacity style="display: none;">
        <div id="dashboard-mount"></div>
      </div>

      <!-- Global Music Player -->
      ${renderMusicPlayer()}
    </div>
  `;
}

// Chạy render một lần lúc load
renderApp();
renderNavbar();
renderLandingPage();
renderDashboard();

// Không cần gọi renderNavbar() khi hashchange vì Alpine $store.app.route đã tự động trigger reactivity.

window.setupScrollAnimations = function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Thêm chút delay cho các items ở gần nhau (stagger effect)
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    observer.observe(el);
  });
};

// Chạy lần đầu
setTimeout(() => window.setupScrollAnimations(), 500);

// Khởi động Alpine.js cuối cùng sau khi mọi thứ đã render
Alpine.start();
