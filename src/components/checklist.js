import { onChecklistChange, addChecklistItem, updateChecklistItem, toggleChecklistItem, assignChecklistItem, deleteChecklistItem } from "../firebase/database.js";
import { showToast } from "./toast.js";
import { openModal } from "./modal.js";

const CATEGORIES = [
  { id: 'food', icon: '🍖', name: 'Thực phẩm', color: 'golden' },
  { id: 'drink', icon: '🥤', name: 'Đồ uống', color: 'sky' },
  { id: 'tools', icon: '🔧', name: 'Dụng cụ', color: 'purple' },
  { id: 'personal', icon: '🎒', name: 'Cá nhân', color: 'coral' },
  { id: 'other', icon: '📦', name: 'Khác', color: 'emerald' }
];

const renderItemTemplate = (iteratorStr) => `
  <template x-for="${iteratorStr}" :key="item.id">
    <div class="glass-card checklist-item-card" :style="item.completed ? 'opacity: 0.6;' : ''">
      
      <div class="checklist-row-wrapper" @click="toggle(item)">
        <div class="checklist-checkbox" 
             :style="item.completed ? 'background: var(--emerald-400);' : 'background: rgba(52, 211, 153, 0.1);'">
          <span class="checklist-checkmark" x-show="item.completed">✓</span>
        </div>
        
        <div class="checklist-content-wrapper">
          <div class="checklist-item-text" :style="item.completed ? 'text-decoration: line-through; color: var(--text-dim);' : 'color: var(--text-primary);'">
            <span x-text="item.name"></span> 
            <span class="checklist-quantity" x-show="item.quantity"> (<span x-text="item.quantity"></span>)</span>
          </div>
          <div x-show="item.notes" style="font-size: var(--fs-xs); color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">
            <span style="opacity: 0.7;">📝 </span><span x-text="item.notes"></span>
          </div>
          <div x-show="item.completed" style="font-size: var(--fs-xs); color: var(--emerald-400); margin-top: 2px;">
            ✅ Hoàn thành bởi <span x-text="getMemberName(item.completedBy)"></span>
          </div>
        </div>
      </div>

      <!-- Right actions -->
      <div class="checklist-actions" style="display: flex; align-items: center; gap: var(--space-4);">
        
        <!-- Avatar dropdown for assignment -->
        <div>
          <div @click="openAssignModal(item)" style="cursor: pointer; display: flex; align-items: center;" title="Phân công">
            <div x-show="getAssigneesList(item).length === 0">
              <button class="btn" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: rgba(255,255,255,0.05); border: 1px dashed var(--text-dim); border-radius: 4px; color: var(--text-secondary);">
                👤 Phân công
              </button>
            </div>
            <div x-show="getAssigneesList(item).length > 0" class="navbar-members" style="margin-right: 0; display: flex; align-items: center; flex-wrap: nowrap;">
              <template x-for="(uid, index) in getAssigneesList(item).slice(0, 3)" :key="uid">
                <div class="avatar" style="width: 30px; height: 30px; margin-left: -8px;" :style="'z-index: ' + (10 - index) + ';'" x-html="window.renderAvatarHtml(getMemberAvatar(uid))"></div>
              </template>
              <div x-show="getAssigneesList(item).length > 3" class="avatar" style="width: 30px; height: 30px; margin-left: -8px; z-index: 1; background: var(--bg-surface); font-size: 0.7rem; border-color: var(--text-dim);">
                <span x-text="'+' + (getAssigneesList(item).length - 3)"></span>
              </div>
              
              <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px dashed var(--text-dim); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--text-secondary); flex-shrink: 0; margin-left: 4px; z-index: 0;" title="Phân công thêm">
                +
              </div>
            </div>
          </div>
        </div>

        <button class="btn" @click="openEditModal(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--sky-400); border: 1px solid transparent;">
          Sửa
        </button>
        <button class="btn" @click="delItem(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--coral-400); border: 1px solid transparent;">
          Xoá
        </button>
      </div>
    </div>
  </template>
`;

export function renderChecklist() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('checklistComponent', () => ({
      items: [],
      filter: 'mine', // mine, all, pending, completed

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
        }
        
        return filtered;
      },

      getMyFilteredItems() {
        const myUid = Alpine.store('app').user?.uid;
        if (!myUid) return [];
        let myItems = this.items.filter(i => this.isAssigned(i, myUid));
        return myItems.sort((a,b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
      },

      openAddModal(categoryId) {
        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Tên đồ cần chuẩn bị / Nhiệm vụ <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="chk-title" class="input" style="width: 100%; transition: all 0.2s;" placeholder="Ví dụ: Lều trại, Đồ nướng..." />
              <div id="chk-title-error" style="color: var(--coral-400); font-size: 12px; margin-top: 4px; display: none;">Vui lòng nhập tên nhiệm vụ</div>
            </div>
            
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Số lượng (Tuỳ chọn)</label>
              <input type="text" id="chk-qty" class="input" style="width: 100%;" placeholder="Ví dụ: 2 cái, 3kg..." />
            </div>
            
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Ghi chú lưu ý (Tuỳ chọn)</label>
              <textarea id="chk-notes" class="input" style="width: 100%; min-height: 80px; resize: vertical; font-family: inherit;" placeholder="Ví dụ: Nhớ mượn của Quân..."></textarea>
            </div>
            
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Người phụ trách (Tuỳ chọn)</label>
              <select id="chk-assignee" class="select" style="width: 100%;">
                <option value="">-- Chưa phân công --</option>
                <template x-data x-for="[uid, m] in Object.entries($store.app.members)" :key="uid">
                  <option :value="uid" x-text="m.name"></option>
                </template>
              </select>
            </div>
          </div>
        `;

        openModal('Thêm nhiệm vụ mới', content, async () => {
          const titleInput = document.getElementById('chk-title');
          const title = titleInput.value.trim();
          const qty = document.getElementById('chk-qty').value.trim();
          const notes = document.getElementById('chk-notes').value.trim();
          const assigneeUid = document.getElementById('chk-assignee').value;
          const assignedTo = assigneeUid ? { [assigneeUid]: true } : null;

          if (!title) {
            document.getElementById('chk-title-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            return false; // Prevent modal from closing
          }

          try {
            const itemData = { name: title, quantity: qty, notes: notes, category: categoryId };
            if (assignedTo) itemData.assignedTo = assignedTo;
            await addChecklistItem(itemData);
            return true; // Close modal
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      openEditModal(item) {
        const app = Alpine.store('app');
        if (!app.isAdmin && item.createdBy !== app.user?.uid) {
           showToast('Chỉ người tạo (hoặc Admin) mới có quyền sửa', 'error');
           return;
        }

        const safeName = (item.name || '').replace(/"/g, '&quot;');
        const safeQty = (item.quantity || '').replace(/"/g, '&quot;');
        const safeNotes = (item.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Tên đồ cần chuẩn bị / Nhiệm vụ <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="chk-edit-title" class="input" style="width: 100%; transition: all 0.2s;" value="${safeName}" />
              <div id="chk-edit-title-error" style="color: var(--coral-400); font-size: 12px; margin-top: 4px; display: none;">Vui lòng nhập tên nhiệm vụ</div>
            </div>
            
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Số lượng (Tuỳ chọn)</label>
              <input type="text" id="chk-edit-qty" class="input" style="width: 100%;" value="${safeQty}" />
            </div>
            
            <div>
              <label style="display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px;">Ghi chú lưu ý (Tuỳ chọn)</label>
              <textarea id="chk-edit-notes" class="input" style="width: 100%; min-height: 80px; resize: vertical; font-family: inherit;">${safeNotes}</textarea>
            </div>
          </div>
        `;

        openModal('Sửa nhiệm vụ', content, async () => {
          const titleInput = document.getElementById('chk-edit-title');
          const title = titleInput.value.trim();
          const qty = document.getElementById('chk-edit-qty').value.trim();
          const notes = document.getElementById('chk-edit-notes').value.trim();

          if (!title) {
            document.getElementById('chk-edit-title-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            return false;
          }

          try {
            await updateChecklistItem(item.id, { name: title, quantity: qty, notes: notes });
            return true;
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      async toggle(item) {
        try {
          await toggleChecklistItem(item.id, item.completed);
        } catch (e) {
          console.error(e);
        }
      },

      openAssignModal(item) {
        const members = Alpine.store('app').members || {};
        let memberHtml = Object.entries(members).map(([uid, m]) => {
          const isAssigned = this.isAssigned(item, uid);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) 0; border-bottom: 1px solid var(--border-glass);">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <div class="avatar" style="width: 32px; height: 32px; font-size: 16px; overflow: hidden;">
                  <div style="width: 100%; height: 100%; border-radius: 50%;">${window.renderAvatarHtml ? window.renderAvatarHtml(m.avatar) : '👤'}</div>
                </div>
                <span style="color: var(--text-primary);">${m.name}</span>
              </div>
              <input type="checkbox" class="assign-checkbox" value="${uid}" ${isAssigned ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--emerald-400);" />
            </div>
          `;
        }).join('');

        const content = `
          <div style="display: flex; flex-direction: column; max-height: 50vh; overflow-y: auto;">
            ${memberHtml}
          </div>
        `;

        openModal(`Phân công: ${item.name}`, content, async () => {
          const checkboxes = document.querySelectorAll('.assign-checkbox');
          let newAssigned = {};
          checkboxes.forEach(cb => {
            if (cb.checked) {
              newAssigned[cb.value] = true;
            }
          });

          if (Object.keys(newAssigned).length === 0) {
            newAssigned = null;
          }

          try {
            await assignChecklistItem(item.id, newAssigned);
            return true;
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      isAssigned(item, uid) {
        if (!item.assignedTo) return false;
        if (typeof item.assignedTo === 'string') return item.assignedTo === uid;
        return !!item.assignedTo[uid];
      },

      getAssigneesList(item) {
        if (!item.assignedTo) return [];
        if (typeof item.assignedTo === 'string') return [item.assignedTo];
        return Object.keys(item.assignedTo);
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
      get myTotalItems() { 
         const myUid = Alpine.store('app').user?.uid;
         if (!myUid) return 0;
         return this.items.filter(i => this.isAssigned(i, myUid)).length; 
      },
      get myCompletedItems() { 
         const myUid = Alpine.store('app').user?.uid;
         if (!myUid) return 0;
         return this.items.filter(i => this.isAssigned(i, myUid) && i.completed).length; 
      },
      get myProgressPercent() {
        if (this.myTotalItems === 0) return 0;
        return Math.round((this.myCompletedItems / this.myTotalItems) * 100);
      },
      get memberStats() {
        const stats = {};
        const members = Alpine.store('app').members || {};
        
        // Initialize stats for all members
        Object.keys(members).forEach(uid => {
          stats[uid] = { total: 0, completed: 0, uid, avatar: members[uid].avatar, name: members[uid].name };
        });

        this.items.forEach(i => {
          if (i.assignedTo) {
            let uids = [];
            if (typeof i.assignedTo === 'string') uids = [i.assignedTo];
            else uids = Object.keys(i.assignedTo);

            uids.forEach(uid => {
              if (stats[uid]) {
                stats[uid].total++;
                if (i.completed) stats[uid].completed++;
              }
            });
          }
        });

        return Object.values(stats).filter(s => s.total > 0).sort((a,b) => b.total - a.total);
      }
    }));
  });

  return `
    <div x-data="checklistComponent" class="checklist-grid">
      
      <div>
        <div class="checklist-filter-bar" style="display: flex; gap: var(--space-2); margin-bottom: var(--space-6); overflow-x: auto; padding-bottom: var(--space-2);">
          <button class="nav-tab" :class="filter === 'mine' ? 'active' : ''" @click="filter = 'mine'" style="font-weight: bold; flex-shrink: 0;" :style="filter === 'mine' ? '' : 'color: var(--golden-400); border-color: var(--golden-400);'">🎯 Phần mình lo</button>
          <button class="nav-tab" :class="filter === 'all' ? 'active' : ''" @click="filter = 'all'">Tất cả</button>
          <button class="nav-tab" :class="filter === 'pending' ? 'active' : ''" @click="filter = 'pending'">Chưa xong</button>
          <button class="nav-tab" :class="filter === 'completed' ? 'active' : ''" @click="filter = 'completed'">Đã xong</button>
        </div>

        <!-- Flat view for 'mine' -->
        <div x-show="filter === 'mine'">
          <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4);">
            ${renderItemTemplate("item in getMyFilteredItems()")}
            
            <div x-show="getMyFilteredItems().length === 0" style="text-align: center; color: var(--text-dim); padding: var(--space-8); font-style: italic;">
              Bạn chưa có nhiệm vụ nào được phân công.
            </div>
          </div>
        </div>

        <!-- Categorized view for other filters -->
        <div x-show="filter !== 'mine'" style="display: none;">
          ${CATEGORIES.map(cat => `
            <div style="margin-bottom: var(--space-8);" x-show="getItems('${cat.id}').length > 0 || filter === 'all'">
              <div class="badge ${cat.color}" style="font-size: var(--fs-lg); margin-bottom: var(--space-4); padding: var(--space-2) var(--space-4);">
                ${cat.icon} ${cat.name}
              </div>

              <!-- List items -->
              <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4);">
                ${renderItemTemplate(`item in getItems('${cat.id}')`)}
              </div>

              <!-- Add new item Button -->
              <button class="btn" x-show="filter === 'all' || filter === 'pending'" style="width: 100%; border: 1px dashed var(--border-glass); background: rgba(255,255,255,0.02); color: var(--text-secondary); justify-content: center; padding: 10px;" @click="openAddModal('${cat.id}')">
                + Thêm mục mới
              </button>
            </div>
          `).join('')}
        </div>

      </div>

      <!-- Right Panel: Progress Tracker -->
      <div style="position: sticky; top: 100px; height: fit-content;">
        <div class="glass-card">
          <div style="display: flex; gap: var(--space-6);">
            
            <!-- Left Side: Circular Progress (Stacked vertically) -->
            <div style="width: 100px; flex-shrink: 0; text-align: center; border-right: 1px solid var(--border-glass); padding-right: var(--space-4);">
              <h4 style="margin-bottom: var(--space-4); color: var(--golden-400); font-size: var(--fs-lg); white-space: nowrap;">Tiến độ</h4>
              
              <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: center;">
                
                <!-- My Progress -->
                <div style="text-align: center;" x-show="myTotalItems > 0">
                  <div style="position: relative; width: 70px; height: 70px; margin: 0 auto var(--space-1) auto;">
                    <svg width="70" height="70" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--golden-400)" stroke-width="8" 
                              stroke-dasharray="263.89" 
                              :stroke-dashoffset="263.89 - (263.89 * myProgressPercent) / 100" 
                              style="transition: stroke-dashoffset 1s ease-out;" />
                    </svg>
                    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                      <span style="font-size: var(--fs-base); font-weight: bold; font-family: var(--font-heading); color: var(--golden-400);" x-text="myProgressPercent + '%'"></span>
                    </div>
                  </div>
                  <div style="font-size: var(--fs-xs); font-weight: bold; color: var(--golden-400);">Của tôi</div>
                </div>

                <!-- Overall Progress -->
                <div style="text-align: center;">
                  <div style="position: relative; width: 70px; height: 70px; margin: 0 auto var(--space-1) auto;">
                    <svg width="70" height="70" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--emerald-400)" stroke-width="8" 
                              stroke-dasharray="263.89" 
                              :stroke-dashoffset="263.89 - (263.89 * progressPercent) / 100" 
                              style="transition: stroke-dashoffset 1s ease-out;" />
                    </svg>
                    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                      <span style="font-size: var(--fs-base); font-weight: bold; font-family: var(--font-heading); color: var(--emerald-400);" x-text="progressPercent + '%'"></span>
                    </div>
                  </div>
                  <div style="font-size: var(--fs-xs); font-weight: bold; color: var(--emerald-400);">Chung</div>
                </div>

              </div>
            </div>

            <!-- Right Side: Members Progress -->
            <div style="flex: 1; overflow: hidden;">
              <h4 style="margin-bottom: var(--space-4); font-size: var(--fs-lg);">Thành viên</h4>
              
              <template x-for="(stat, index) in memberStats" :key="stat.uid">
                <div style="margin-bottom: var(--space-3);">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: var(--fs-sm);">
                    <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                      <div style="width: 20px; height: 20px; flex-shrink: 0; display: inline-block; overflow: hidden; border-radius: 50%;" x-html="window.renderAvatarHtml(stat.avatar)"></div>
                      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" x-text="stat.name"></span>
                    </div>
                    <span style="flex-shrink: 0; margin-left: 8px;"><span x-text="stat.completed"></span> / <span x-text="stat.total"></span></span>
                  </div>
                  <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; border-radius: 3px; transition: width 0.5s ease;"
                         :style="'width: ' + (stat.total === 0 ? 0 : (stat.completed / stat.total * 100)) + '%; background: var(--' + ['emerald', 'golden', 'sky', 'coral', 'purple'][index % 5] + '-400);'">
                    </div>
                  </div>
                </div>
              </template>

              <div x-show="memberStats.length === 0" style="color: var(--text-dim); text-align: center; font-size: var(--fs-sm); font-style: italic;">
                Chưa có mục phân công.
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  `;
}
