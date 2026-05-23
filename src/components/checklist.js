import { onChecklistChange, addChecklistItem, toggleChecklistItem, assignChecklistItem, deleteChecklistItem } from "../firebase/database.js";
import { showToast } from "./toast.js";

const CATEGORIES = [
  { id: 'food', icon: '🍖', name: 'Thực phẩm', color: 'golden' },
  { id: 'drink', icon: '🥤', name: 'Đồ uống', color: 'sky' },
  { id: 'tools', icon: '🔧', name: 'Dụng cụ', color: 'purple' },
  { id: 'personal', icon: '🎒', name: 'Cá nhân', color: 'coral' },
  { id: 'other', icon: '📦', name: 'Khác', color: 'emerald' }
];

export function renderChecklist() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('checklistComponent', () => ({
      items: [],
      filter: 'all', // all, pending, completed, mine
      newItemName: {},
      newItemQty: {},

      init() {
        onChecklistChange((data) => {
          this.items = data;
        });
      },

      getItems(categoryId) {
        let filtered = this.items.filter(i => i.category === categoryId);
        
        if (this.filter === 'pending') {
          filtered = filtered.filter(i => !i.completed);
        } else if (this.filter === 'completed') {
          filtered = filtered.filter(i => i.completed);
        } else if (this.filter === 'mine') {
          const myUid = Alpine.store('app').user?.uid;
          filtered = filtered.filter(i => i.assignedTo === myUid);
        }
        
        return filtered;
      },

      async addItem(categoryId) {
        const name = this.newItemName[categoryId]?.trim();
        const qty = this.newItemQty[categoryId]?.trim() || '1';

        if (!name) {
          showToast('Vui lòng nhập tên đồ cần chuẩn bị', 'error');
          return;
        }

        try {
          await addChecklistItem({ name, quantity: qty, category: categoryId });
          this.newItemName[categoryId] = '';
          this.newItemQty[categoryId] = '';
          showToast('Đã thêm', 'success');
        } catch (e) {
          console.error(e);
        }
      },

      async toggle(item) {
        try {
          await toggleChecklistItem(item.id, item.completed);
        } catch (e) {
          console.error(e);
        }
      },

      async assign(item, memberId) {
        try {
          await assignChecklistItem(item.id, memberId);
          showToast('Đã phân công', 'success');
        } catch (e) {
          console.error(e);
        }
      },

      async delItem(item) {
        const app = Alpine.store('app');
        if (!app.isAdmin && item.createdBy !== app.user?.uid) {
           showToast('Chỉ người tạo (hoặc Admin) mới có quyền xoá', 'error');
           return;
        }
        if (confirm('Xoá mục này?')) {
          await deleteChecklistItem(item.id);
        }
      },

      getMemberAvatar(uid) {
        return Alpine.store('app').members[uid]?.avatar || '👤';
      },
      
      getMemberName(uid) {
        return Alpine.store('app').members[uid]?.name || 'Khách';
      },

      // Progress calculation
      get totalItems() { return this.items.length; },
      get completedItems() { return this.items.filter(i => i.completed).length; },
      get progressPercent() { 
        if (this.totalItems === 0) return 0;
        return Math.round((this.completedItems / this.totalItems) * 100);
      },
      get memberStats() {
        const stats = {};
        const members = Alpine.store('app').members || {};
        
        // Initialize stats for all members
        Object.keys(members).forEach(uid => {
          stats[uid] = { total: 0, completed: 0, uid, avatar: members[uid].avatar, name: members[uid].name };
        });

        this.items.forEach(i => {
          if (i.assignedTo && stats[i.assignedTo]) {
            stats[i.assignedTo].total++;
            if (i.completed) stats[i.assignedTo].completed++;
          }
        });

        return Object.values(stats).filter(s => s.total > 0).sort((a,b) => b.total - a.total);
      }
    }));
  });

  return `
    <div x-data="checklistComponent" style="display: grid; grid-template-columns: 1fr; gap: var(--space-8); @media(min-width: 1024px) { grid-template-columns: 2fr 1fr; }">
      
      <!-- Left Panel: Checklist -->
      <div>
        <div class="checklist-filter-bar" style="display: flex; gap: var(--space-2); margin-bottom: var(--space-6); overflow-x: auto; padding-bottom: var(--space-2);">
          <button class="nav-tab" :class="filter === 'all' ? 'active' : ''" @click="filter = 'all'">Tất cả</button>
          <button class="nav-tab" :class="filter === 'pending' ? 'active' : ''" @click="filter = 'pending'">Chưa xong</button>
          <button class="nav-tab" :class="filter === 'completed' ? 'active' : ''" @click="filter = 'completed'">Đã xong</button>
          <button class="nav-tab" :class="filter === 'mine' ? 'active' : ''" @click="filter = 'mine'">Của tôi</button>
        </div>

        ${CATEGORIES.map(cat => `
          <div style="margin-bottom: var(--space-8);">
            <div class="badge ${cat.color}" style="font-size: var(--fs-lg); margin-bottom: var(--space-4); padding: var(--space-2) var(--space-4);">
              ${cat.icon} ${cat.name}
            </div>

            <!-- List items -->
            <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4);">
              <template x-for="item in getItems('${cat.id}')" :key="item.id">
                <div class="glass-card" style="padding: var(--space-2) var(--space-4); display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;" :style="item.completed ? 'opacity: 0.6;' : ''">
                  
                  <div style="display: flex; align-items: center; gap: var(--space-4); flex: 1;">
                    <div style="width: 24px; height: 24px; border-radius: 4px; border: 2px solid var(--emerald-400); display: flex; align-items: center; justify-content: center; cursor: pointer;" 
                         :style="item.completed ? 'background: var(--emerald-400);' : ''"
                         @click="toggle(item)">
                      <span x-show="item.completed" style="color: var(--bg-deep); font-size: 14px;">✓</span>
                    </div>
                    
                    <div style="flex: 1;">
                      <div style="font-size: var(--fs-lg);" :style="item.completed ? 'text-decoration: line-through; color: var(--text-dim);' : ''">
                        <span x-text="item.name"></span> 
                        <span style="color: var(--text-secondary); font-size: var(--fs-sm);" x-show="item.quantity"> (x<span x-text="item.quantity"></span>)</span>
                      </div>
                      <div x-show="item.completed" style="font-size: var(--fs-xs); color: var(--emerald-400);">
                        ✅ Hoàn thành bởi <span x-text="getMemberName(item.completedBy)"></span>
                      </div>
                    </div>
                  </div>

                  <!-- Right actions -->
                  <div style="display: flex; align-items: center; gap: var(--space-4);">
                    
                    <!-- Avatar dropdown for assignment -->
                    <div style="position: relative;" x-data="{ open: false }">
                      <div class="avatar" style="width: 30px; height: 30px; cursor: pointer; overflow: hidden;" @click="open = !open" :title="item.assignedTo ? 'Được phân công cho: ' + getMemberName(item.assignedTo) : 'Phân công'">
                        <span x-show="!item.assignedTo" style="color: var(--text-dim);">?</span>
                        <div style="width: 100%; height: 100%;" x-show="item.assignedTo" x-html="window.renderAvatarHtml(getMemberAvatar(item.assignedTo))"></div>
                      </div>
                      
                      <!-- Dropdown menu -->
                      <div x-show="open" @click.outside="open = false" style="position: absolute; right: 0; top: 100%; margin-top: 5px; background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: var(--space-2); z-index: 10; display: flex; flex-direction: column; gap: var(--space-2); min-width: 150px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" style="display:none;">
                        <div style="font-size: var(--fs-xs); color: var(--text-secondary); padding: 4px;">Phân công cho:</div>
                        <template x-for="uid in Object.keys($store.app.members)" :key="uid">
                          <button class="btn" style="justify-content: flex-start; padding: 4px 8px; width: 100%;" :style="item.assignedTo === uid ? 'background: rgba(255,255,255,0.1);' : ''" @click="assign(item, uid); open = false">
                            <div style="width: 24px; height: 24px; display: inline-block; overflow: hidden; border-radius: 50%; vertical-align: middle; margin-right: 8px;" x-html="window.renderAvatarHtml($store.app.members[uid].avatar)"></div>
                            <span x-text="$store.app.members[uid].name"></span>
                          </button>
                        </template>
                        <button class="btn" style="justify-content: flex-start; padding: 4px 8px; width: 100%; color: var(--coral-400);" @click="assign(item, null); open = false" x-show="item.assignedTo">
                          Bỏ phân công
                        </button>
                      </div>
                    </div>

                    <button class="btn-icon" @click="delItem(item)" title="Xoá">🗑️</button>
                  </div>
                </div>
              </template>
            </div>

            <!-- Add new item -->
            <div class="checklist-add-form" style="display: flex; gap: var(--space-2);">
              <input type="text" class="input" placeholder="Thêm đồ cần chuẩn bị..." x-model="newItemName['${cat.id}']" @keydown.enter="addItem('${cat.id}')" style="flex: 2;" />
              <input type="text" class="input" placeholder="SL (VD: 2kg)" x-model="newItemQty['${cat.id}']" @keydown.enter="addItem('${cat.id}')" style="flex: 1;" />
              <button class="btn btn-primary" @click="addItem('${cat.id}')">Thêm</button>
            </div>
          </div>
        `).join('')}

      </div>

      <!-- Right Panel: Progress Tracker -->
      <div style="position: sticky; top: 100px; height: fit-content;">
        <div class="glass-card" style="text-align: center; margin-bottom: var(--space-6);">
          <h3 style="margin-bottom: var(--space-4); color: var(--golden-400);">Tiến độ chuẩn bị</h3>
          
          <!-- Circular Progress -->
          <div style="position: relative; width: 150px; height: 150px; margin: 0 auto var(--space-4) auto;">
            <svg width="150" height="150" viewBox="0 0 150 150" style="transform: rotate(-90deg);">
              <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12" />
              <circle cx="75" cy="75" r="65" fill="none" stroke="var(--emerald-400)" stroke-width="12" 
                      stroke-dasharray="408.4" 
                      :stroke-dashoffset="408.4 - (408.4 * progressPercent) / 100" 
                      style="transition: stroke-dashoffset 1s ease-out;" />
            </svg>
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-size: var(--fs-3xl); font-weight: bold; font-family: var(--font-heading);" x-text="progressPercent + '%'"></span>
            </div>
          </div>

          <p style="color: var(--text-secondary);">
            <span x-text="completedItems"></span> / <span x-text="totalItems"></span> mục đã xong
          </p>
        </div>

        <div class="glass-card">
          <h4 style="margin-bottom: var(--space-4);">Theo thành viên</h4>
          
          <template x-for="(stat, index) in memberStats" :key="stat.uid">
            <div style="margin-bottom: var(--space-3);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: var(--fs-sm);">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 20px; height: 20px; display: inline-block; overflow: hidden; border-radius: 50%;" x-html="window.renderAvatarHtml(stat.avatar)"></div>
                  <span x-text="stat.name"></span>
                </div>
                <span><span x-text="stat.completed"></span> / <span x-text="stat.total"></span></span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <!-- Dùng array colors: emerald, golden, sky, coral, purple -->
                <div style="height: 100%; border-radius: 3px; transition: width 0.5s ease;"
                     :style="'width: ' + (stat.total === 0 ? 0 : (stat.completed / stat.total * 100)) + '%; background: var(--' + ['emerald', 'golden', 'sky', 'coral', 'purple'][index % 5] + '-400);'">
                </div>
              </div>
            </div>
          </template>

          <div x-show="memberStats.length === 0" style="color: var(--text-dim); text-align: center; font-size: var(--fs-sm); font-style: italic;">
            Chưa có mục nào được phân công.
          </div>
        </div>
      </div>

    </div>
  `;
}
