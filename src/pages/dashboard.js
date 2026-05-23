import { renderSchedule } from "../components/schedule.js";
import { renderChecklist } from "../components/checklist.js";
import { renderVoting } from "../components/voting.js";
import { renderExpenses } from "../components/expenses.js";

export function renderDashboard() {
  const mount = document.getElementById('dashboard-mount');
  if (!mount) return;

  mount.innerHTML = `
    <div class="dashboard-layout">
      <div class="container dashboard-content">
        <!-- Dashboard Header / Welcome -->
        <div style="margin-bottom: var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);" class="animate-fade-up">
          <div>
            <h1 style="font-size: var(--fs-3xl); color: var(--emerald-400); font-family: var(--font-heading);">
              Chào <span x-text="$store.app.user?.displayName || 'bạn'"></span>! 👋
            </h1>
            <p style="color: var(--text-secondary); margin-top: var(--space-1);">Cùng xây dựng chuyến đi thật cháy nào!</p>
          </div>
          
          <div class="glass-card hover-glow" style="padding: var(--space-2) var(--space-4); display: flex; align-items: center; gap: var(--space-4); cursor: pointer;" onclick="window.showMembers()" title="Xem danh sách thành viên">
            <div style="text-align: right;">
              <p style="font-size: var(--fs-xs); color: var(--text-secondary); text-transform: uppercase;">Thành viên</p>
              <p style="font-size: var(--fs-lg); font-weight: bold; color: var(--golden-400);" x-text="Object.keys($store.app.members || {}).length">0</p>
            </div>
            <div style="width: 1px; height: 30px; background: var(--border-glass);"></div>
            <div style="text-align: right;">
              <p style="font-size: var(--fs-xs); color: var(--text-secondary); text-transform: uppercase;">Online</p>
              <p style="font-size: var(--fs-lg); font-weight: bold; color: var(--emerald-400);" x-text="Object.values($store.app.members || {}).filter(m => m.isOnline).length">0</p>
            </div>
          </div>
        </div>

        <!-- Tab Contents -->
        <div class="glass-card animate-fade-in" style="min-height: 60vh;">
          
          <!-- Lịch Trình Tab -->
          <div x-show="$store.app.route.includes('schedule') || $store.app.route === '#/dashboard'">
            ${renderSchedule()}
          </div>

          <!-- Chuẩn Bị Tab -->
          <div x-show="$store.app.route.includes('checklist')" style="display: none;">
            ${renderChecklist()}
          </div>

          <!-- Bình Chọn Tab -->
          <div x-show="$store.app.route.includes('polls')" style="display: none;">
            ${renderVoting()}
          </div>

          <!-- Chi Phí Tab -->
          <div x-show="$store.app.route.includes('expenses')" style="display: none;">
            ${renderExpenses()}
          </div>

        </div>
      </div>
    </div>
  `;
}
