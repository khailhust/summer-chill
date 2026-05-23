import { openModal } from "./modal.js";
import { deleteMember } from "../firebase/database.js";
import { showToast } from "./toast.js";

document.addEventListener('alpine:init', () => {
  Alpine.data('membersComponent', () => ({
    isAdmin() {
      return Alpine.store('app').isAdmin;
    },
    async delMember(uid) {
      if (!this.isAdmin()) return;
      if (confirm('Xoá thành viên này khỏi nhóm? (Thành viên sẽ bị mất quyền truy cập vào dữ liệu của họ)')) {
        try {
          await deleteMember(uid);
          showToast('Đã xoá thành viên', 'success');
        } catch (e) {
          console.error(e);
          showToast('Lỗi khi xoá', 'error');
        }
      }
    }
  }));
});

export function renderMembersSidebar() {

  const content = `
    <div x-data="membersComponent" style="display: flex; flex-direction: column; gap: var(--space-4); max-height: 60vh; overflow-y: auto;">
      <template x-for="uid in Object.keys($store.app.members)" :key="uid">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4);">
          
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="position: relative;">
              <div class="avatar" style="width: 48px; height: 48px; overflow: hidden;">
                <div style="width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;" x-html="window.renderAvatarHtml($store.app.members[uid].avatar)"></div>
              </div>
              <div x-show="$store.app.members[uid].isOnline" class="avatar-online-dot animate-pulse-dot" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border: 2px solid var(--bg-deep);"></div>
              <div x-show="!$store.app.members[uid].isOnline" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--text-dim); border: 2px solid var(--bg-deep);"></div>
            </div>
            
            <div>
              <p style="font-weight: 500; font-size: var(--fs-lg); color: var(--text-primary);">
                <span x-text="$store.app.members[uid].name"></span>
                <span x-show="uid === $store.app.user?.uid" style="font-size: var(--fs-xs); color: var(--emerald-400); margin-left: var(--space-2); border: 1px solid var(--emerald-400); padding: 2px 6px; border-radius: 10px;">Bạn</span>
              </p>
              <p style="font-size: var(--fs-xs); color: var(--text-secondary);">
                <span x-show="$store.app.members[uid].isOnline" style="color: var(--emerald-400);">Đang hoạt động</span>
                <span x-show="!$store.app.members[uid].isOnline">Đang offline</span>
              </p>
            </div>
          </div>
          
          <button class="btn-icon" x-show="isAdmin() && uid !== $store.app.user?.uid" @click="delMember(uid)" title="Xoá thành viên này" style="color: var(--coral-400);">🗑️</button>
        </div>
      </template>

      <div x-show="Object.keys($store.app.members || {}).length === 0" style="text-align: center; color: var(--text-dim); padding: var(--space-4); font-style: italic;">
        Chưa có thành viên nào.
      </div>
    </div>
  `;

  openModal('👥 Danh sách thành viên', content);
}

// Gắn hàm này vào global để gọi từ HTML dễ dàng (VD: onclick="showMembers()")
window.showMembers = renderMembersSidebar;
