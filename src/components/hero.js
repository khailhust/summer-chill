import { TRIP_DATA, RESORT_DATA } from "../utils/constants.js";
import { setupCountdown } from "../utils/countdown.js";

export function renderHero() {
  const start = new Date(TRIP_DATA.startDate);
  const end = new Date(TRIP_DATA.endDate);
  const startD = start.getDate().toString().padStart(2, '0');
  const endD = end.getDate().toString().padStart(2, '0');
  const month = (start.getMonth() + 1).toString().padStart(2, '0');
  const year = start.getFullYear();

  // Alpine component cho hero
  document.addEventListener('alpine:init', () => {
    Alpine.data('heroComponent', () => ({
      countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      interval: null,
      init() {
        this.interval = setupCountdown(TRIP_DATA.startDate, (data) => {
          this.countdown = data;
        });
      },
      destroy() {
        if (this.interval) clearInterval(this.interval);
      }
    }));
  });

  return `
    <section class="hero-section" x-data="heroComponent">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      
      <!-- Leaf particles -->
      <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
        <template x-for="i in 15" :key="i">
          <div class="leaf" :style="'left: ' + (Math.random() * 100) + '%; animation-duration: ' + (5 + Math.random() * 10) + 's; animation-delay: ' + (Math.random() * 5) + 's;'">🍃</div>
        </template>
      </div>

      <div class="container animate-fade-up">
        <h1 class="hero-title">${TRIP_DATA.title}</h1>
        <p class="hero-slogan">"${TRIP_DATA.slogan}"</p>
        
        <div style="display: flex; justify-content: center; margin-bottom: var(--space-8);">
          <div style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(8px); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); overflow: hidden;">
            <div style="padding: 1rem 2.5rem; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--emerald-400); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: 600;">Khởi hành</div>
              <div style="font-size: 2.2rem; font-weight: 700; font-family: var(--font-heading); color: white; line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${startD}/${month}</div>
            </div>
            
            <div style="width: 1px; height: 50px; background: rgba(255,255,255,0.2);"></div>
            
            <div style="padding: 1rem 2.5rem; text-align: center;">
              <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: 600;">Kết thúc</div>
              <div style="font-size: 2.2rem; font-weight: 700; font-family: var(--font-heading); color: rgba(255,255,255,0.8); line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${endD}/${month}</div>
            </div>
          </div>
        </div>

        <div class="countdown-container">
          <div class="glass-card countdown-box">
            <span class="countdown-number" x-text="countdown.days">0</span>
            <span class="countdown-label">Ngày</span>
          </div>
          <div class="glass-card countdown-box">
            <span class="countdown-number" x-text="countdown.hours.toString().padStart(2, '0')">00</span>
            <span class="countdown-label">Giờ</span>
          </div>
          <div class="glass-card countdown-box">
            <span class="countdown-number" x-text="countdown.minutes.toString().padStart(2, '0')">00</span>
            <span class="countdown-label">Phút</span>
          </div>
          <div class="glass-card countdown-box">
            <span class="countdown-number" x-text="countdown.seconds.toString().padStart(2, '0')">00</span>
            <span class="countdown-label">Giây</span>
          </div>
        </div>

        <a href="#/dashboard" class="btn btn-primary" style="font-size: var(--fs-xl); padding: var(--space-4) var(--space-8); border-radius: var(--radius-xl); box-shadow: 0 10px 30px var(--glow-golden);">
        Tham gia ngay
      </a>
      </div>
    </section>
  `;
}
