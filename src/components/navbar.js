export function renderNavbar() {
  const mount = document.getElementById('navbar-mount');
  if (!mount) return;

  mount.innerHTML = `
    <nav class="navbar" :class="$store.app.isDashboard ? 'dashboard-mode' : 'landing-mode'">
      <a href="#/" class="navbar-logo">SummerChill</a>
      
      <!-- Hiển thị khi ở landing page -->
      <div x-show="!$store.app.isDashboard" style="display: none;">
        <a href="#/dashboard" class="btn btn-primary">Tham gia ngay <span x-show="!$store.app.isOnline"> (Offline)</span></a>
      </div>

      <!-- Hiển thị khi ở dashboard -->
      <div x-show="$store.app.isDashboard" class="navbar-dashboard-content" style="display: none;">
        
        <!-- Tabs -->
        <div class="navbar-tabs" style="margin-left: var(--space-10);">
          <a href="#/dashboard/schedule" class="nav-tab" :class="$store.app.route.includes('schedule') || $store.app.route === '#/dashboard' ? 'active' : ''">📅 Lịch trình</a>
          <a href="#/dashboard/checklist" class="nav-tab" :class="$store.app.route.includes('checklist') ? 'active' : ''">✅ Chuẩn bị</a>
          <a href="#/dashboard/polls" class="nav-tab" :class="$store.app.route.includes('polls') ? 'active' : ''">🗳️ Bình chọn</a>
          <a href="#/dashboard/expenses" class="nav-tab" :class="$store.app.route.includes('expenses') ? 'active' : ''">💰 Chi phí</a>
        </div>

        <!-- Right Side: Status + Members -->
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <!-- Offline indicator -->
          <div x-show="!$store.app.isOnline" class="badge coral" style="display: none;">
            📡 Offline
          </div>
          
          <div x-show="$store.app.isOnline" class="badge emerald" style="display: none;">
            ⚡ Online
          </div>

          <!-- Members List -->
          <div class="navbar-members" style="cursor: pointer;" onclick="window.showMembers()" title="Xem danh sách thành viên">
            <template x-for="(id, index) in Object.keys($store.app.members).sort((a,b) => ($store.app.members[b].isOnline ? 1 : 0) - ($store.app.members[a].isOnline ? 1 : 0)).slice(0, 3)" :key="id">
              <div class="avatar" :title="$store.app.members[id].name" :style="'z-index: ' + (10 - index) + ';'">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;" x-html="window.renderAvatarHtml($store.app.members[id].avatar)"></div>
                <div x-show="$store.app.members[id].isOnline" class="avatar-online-dot animate-pulse-dot" style="display: none;"></div>
              </div>
            </template>
            <div x-show="Object.keys($store.app.members).length > 3" class="avatar" style="background: var(--bg-surface); z-index: 1; font-size: 0.8rem; font-weight: bold; color: var(--text-secondary); border-color: var(--text-dim);" style="display: none;">
              <span x-text="'+' + (Object.keys($store.app.members).length - 3)"></span>
            </div>
          </div>
        </div>

      </div>
    </nav>
  `;
}
