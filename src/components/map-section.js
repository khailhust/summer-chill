import { TRANSPORT_DATA, RESORT_DATA } from "../utils/constants.js";

export function renderMapSection() {
  return `
    <section class="container" style="padding: var(--space-8) var(--space-4);">
      <div class="map-section-grid">
        
        <!-- Info Cards -->
        <div class="reveal-on-scroll" style="display: flex; flex-direction: column; gap: var(--space-4); justify-content: center;">
          <h2 style="font-size: var(--fs-4xl); font-family: var(--font-heading); color: var(--emerald-400); margin-bottom: var(--space-4); text-transform: uppercase; letter-spacing: 1px;">Di chuyển</h2>
          
          <div style="background: rgba(255,255,255,0.03); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(56, 189, 248, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(56, 189, 248, 0.2);">🚗</div>
            <div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Phương tiện</p>
              <p style="font-size: 1.2rem; font-weight: 600; color: white;">${TRANSPORT_DATA.method}</p>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(251, 191, 36, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(251, 191, 36, 0.2);">📍</div>
            <div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Khoảng cách từ HN</p>
              <p style="font-size: 1.2rem; font-weight: 600; color: white;">${TRANSPORT_DATA.distance}</p>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(167, 139, 250, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(167, 139, 250, 0.2);">⏱️</div>
            <div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Thời gian di chuyển</p>
              <p style="font-size: 1.2rem; font-weight: 600; color: white;">Khoảng ${TRANSPORT_DATA.time}</p>
            </div>
          </div>

          <div style="margin-top: 0.5rem; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2); padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.2rem;">💡</span>
            <span style="color: var(--golden-400); font-size: 0.95rem; line-height: 1.4;">Điểm hẹn xuất phát sẽ được chốt trong phần Bình chọn</span>
          </div>
        </div>

        <!-- Google Map Iframe -->
        <div class="reveal-on-scroll" style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div class="glass-card" style="padding: 0; overflow: hidden; border-radius: var(--radius-lg); height: 400px; position: relative;">
            <iframe 
              src="https://maps.google.com/maps?q=Monty+Retreat,+Kim+Anh,+Hà+Nội&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <div style="text-align: right; margin-top: 8px;">
            <a href="${RESORT_DATA.mapLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(52, 211, 153, 0.1); color: var(--emerald-400); padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 500; font-size: 0.95rem; border: 1px solid rgba(52, 211, 153, 0.2); transition: all 0.2s;" onmouseover="this.style.background='rgba(52, 211, 153, 0.2)'" onmouseout="this.style.background='rgba(52, 211, 153, 0.1)'">
              <span>📍</span> Mở trên ứng dụng Google Maps
            </a>
          </div>
        </div>

      </div>
    </section>
  `;
}
