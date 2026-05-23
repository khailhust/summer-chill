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
          <a href="#/dashboard/schedule" class="nav-tab" style="display: flex; align-items: center; gap: 6px;" :class="$store.app.route.includes('schedule') || $store.app.route === '#/dashboard' ? 'active' : ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Lịch trình
          </a>
          <a href="#/dashboard/checklist" class="nav-tab" style="display: flex; align-items: center; gap: 6px;" :class="$store.app.route.includes('checklist') ? 'active' : ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            Chuẩn bị
          </a>
          <a href="#/dashboard/polls" class="nav-tab" style="display: flex; align-items: center; gap: 6px;" :class="$store.app.route.includes('polls') ? 'active' : ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Bình chọn
          </a>
          <a href="#/dashboard/expenses" class="nav-tab" style="display: flex; align-items: center; gap: 6px;" :class="$store.app.route.includes('expenses') ? 'active' : ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
            Chi phí
          </a>
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
