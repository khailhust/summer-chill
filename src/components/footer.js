import { TRIP_DATA } from "../utils/constants.js";

export function renderFooter() {
  return `
    <footer style="margin-top: var(--space-16); border-top: 1px solid var(--border-glass); background: linear-gradient(to bottom, var(--bg-deep), #0a140a); padding: var(--space-12) var(--space-4) var(--space-6);">
      <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-8); margin-bottom: var(--space-12);">
        
        <!-- Branding -->
        <div>
          <h2 style="font-family: var(--font-heading); font-size: var(--fs-4xl); color: var(--emerald-400); margin-bottom: var(--space-4); text-shadow: 0 2px 10px rgba(52, 211, 153, 0.2);">
            SummerChill
          </h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.6;">
            Ứng dụng hỗ trợ lên kế hoạch, quản lý lịch trình, chi phí và biểu quyết dành riêng cho những chuyến đi chơi của nhóm bạn. Mọi thứ bạn cần cho một chuyến đi hoàn hảo đều nằm gọn tại đây!
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 style="color: var(--text-primary); margin-bottom: var(--space-4); font-size: var(--fs-lg);">Truy cập nhanh</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
            <li><a href="#/dashboard" style="color: var(--text-secondary); font-size: var(--fs-sm); transition: color var(--transition-fast);" onmouseover="this.style.color='var(--emerald-400)'" onmouseout="this.style.color='var(--text-secondary)'">Dashboard Lên Kế Hoạch</a></li>
            <li><a href="#/" style="color: var(--text-secondary); font-size: var(--fs-sm); transition: color var(--transition-fast);" onmouseover="this.style.color='var(--emerald-400)'" onmouseout="this.style.color='var(--text-secondary)'">Trang chủ / Giới thiệu</a></li>
            <li><a href="#/" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;" style="color: var(--text-secondary); font-size: var(--fs-sm); transition: color var(--transition-fast);" onmouseover="this.style.color='var(--emerald-400)'" onmouseout="this.style.color='var(--text-secondary)'">Cuộn lên đầu trang ↑</a></li>
          </ul>
        </div>

        <!-- Support / Contact -->
        <div>
          <h3 style="color: var(--text-primary); margin-bottom: var(--space-4); font-size: var(--fs-lg);">Hỗ trợ chuyến đi</h3>
          
          <div style="background: rgba(255,255,255,0.03); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 16px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(251, 113, 133, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(251, 113, 133, 0.2);">📞</div>
            <div>
              <p style="color: white; font-size: 0.95rem; font-weight: 600; margin-bottom: 2px;">Cần hỗ trợ khẩn cấp?</p>
              <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; line-height: 1.4;">Liên hệ Trưởng đoàn hoặc nhắn tin vào nhóm Zalo.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Copyright -->
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: var(--space-6); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
        <div style="font-size: 0.85rem; color: var(--text-dim); text-align: center;">
          © 2026 Summer Chill Trip. Designed & Developed with <span style="color: var(--coral-400); animation: pulse 2s infinite;">❤️</span> by Khải for the homies.
        </div>
        <div style="display: flex; gap: var(--space-4); margin-top: var(--space-2); opacity: 0.3;">
          <span style="width: 4px; height: 4px; border-radius: 50%; background: white;"></span>
          <span style="width: 4px; height: 4px; border-radius: 50%; background: white;"></span>
          <span style="width: 4px; height: 4px; border-radius: 50%; background: white;"></span>
        </div>
      </div>
    </footer>
  `;
}
