import { ACTIVITIES } from "../utils/constants.js";

export function renderActivities() {
  return `
    <section class="container" style="padding: var(--space-8) var(--space-4) var(--space-16) var(--space-4);">
      <h2 style="font-size: var(--fs-4xl); font-family: var(--font-heading); color: var(--emerald-400); text-align: center; margin-bottom: var(--space-12); text-transform: uppercase; letter-spacing: 1px;" class="reveal-on-scroll">
        Các hoạt động dự kiến
      </h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);">
        ${ACTIVITIES.map((act, index) => `
          <div class="glass-card glass-card-interactive reveal-on-scroll" style="transition-delay: ${index * 100}ms; border: 1px solid rgba(255,255,255,0.05); background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%); display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2.5rem 1.5rem; overflow: hidden; position: relative;">
            
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, transparent, var(--${act.color}-400), transparent); opacity: 0.5;"></div>

            <div style="width: 80px; height: 80px; border-radius: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin-bottom: 1.5rem; box-shadow: inset 0 0 30px rgba(255,255,255,0.05), 0 8px 16px rgba(0,0,0,0.2); position: relative;">
              <div style="position: absolute; inset: 0; border-radius: 24px; box-shadow: inset 0 0 20px var(--${act.color}-400); opacity: 0.3;"></div>
              <span style="position: relative; z-index: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">${act.icon}</span>
            </div>
            
            <h3 style="font-size: 1.4rem; font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 0.75rem; font-weight: 600; letter-spacing: 0.5px;">${act.name}</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${act.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
