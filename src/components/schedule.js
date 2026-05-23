import { onScheduleChange, addScheduleItem, updateScheduleItem, deleteScheduleItem } from "../firebase/database.js";
import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

const CATEGORIES = {
  logistics: { name: 'Di chuyển', color: 'sky' },
  food: { name: 'Ăn uống', color: 'golden' },
  activity: { name: 'Vui chơi', color: 'emerald' },
  entertainment: { name: 'Giải trí', color: 'coral' },
  photo: { name: 'Chụp ảnh', color: 'purple' },
  other: { name: 'Khác', color: 'emerald' }
};

export function renderSchedule() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('scheduleComponent', () => ({
      items: [],
      day1Items: [],
      day2Items: [],
      
      init() {
        onScheduleChange((data) => {
          this.items = data;
          this.day1Items = data.filter(item => item.day === '1').sort((a,b) => a.startTime.localeCompare(b.startTime));
          this.day2Items = data.filter(item => item.day === '2').sort((a,b) => a.startTime.localeCompare(b.startTime));
        });
      },

      getCategoryColor(catId) {
        return CATEGORIES[catId]?.color || 'emerald';
      },
      getCategoryName(catId) {
        return CATEGORIES[catId]?.name || 'Khác';
      },
      getMemberName(uid) {
        return Alpine.store('app').members[uid]?.name || 'Khách';
      },
      getMemberAvatar(uid) {
        return Alpine.store('app').members[uid]?.avatar || '👤';
      },
      isOwnerOrAdmin(uid) {
        const app = Alpine.store('app');
        return app.isAdmin || (app.user?.uid === uid);
      },

      getHourOptions(selected = '08', includeEmpty = false) {
        let html = includeEmpty ? `<option value="">--</option>` : '';
        for(let i=0; i<24; i++) {
          const v = i.toString().padStart(2, '0');
          html += `<option value="${v}" ${v === selected ? 'selected' : ''}>${v}</option>`;
        }
        return html;
      },

      getMinuteOptions(selected = '00') {
        let html = '';
        for(let i=0; i<60; i++) {
          const v = i.toString().padStart(2, '0');
          html += `<option value="${v}" ${v === selected ? 'selected' : ''}>${v}</option>`;
        }
        return html;
      },

      openAddModal() {
        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Ngày</label>
              <select id="sch-day" class="select">
                <option value="1">Ngày 1 (30/05)</option>
                <option value="2">Ngày 2 (31/05)</option>
              </select>
            </div>
            <div style="display: flex; gap: var(--space-4);">
              <div style="flex: 1;">
                <label style="display: block; margin-bottom: var(--space-2);">Giờ bắt đầu</label>
                <div style="display: flex; gap: var(--space-1); align-items: center;">
                  <select id="sch-start-h" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getHourOptions('08')}
                  </select>
                  <span>:</span>
                  <select id="sch-start-m" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getMinuteOptions('00')}
                  </select>
                </div>
              </div>
              <div style="flex: 1;">
                <label style="display: block; margin-bottom: var(--space-2);">Giờ kết thúc</label>
                <div style="display: flex; gap: var(--space-1); align-items: center;">
                  <select id="sch-end-h" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getHourOptions('', true)}
                  </select>
                  <span>:</span>
                  <select id="sch-end-m" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getMinuteOptions('00')}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Tiêu đề hoạt động <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="sch-title" class="input" placeholder="Ví dụ: Ăn trưa tại nhà hàng..." required />
              <div id="sch-title-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Vui lòng nhập tiêu đề hoạt động</div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Phân loại</label>
              <select id="sch-cat" class="select">
                ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Ghi chú thêm</label>
              <textarea id="sch-desc" class="textarea" rows="2" placeholder="Mang theo đồ bơi..."></textarea>
            </div>
          </div>
        `;

        openModal('Thêm hoạt động', content, async () => {
          const day = document.getElementById('sch-day').value;
          const startH = document.getElementById('sch-start-h').value;
          const startM = document.getElementById('sch-start-m').value;
          const endH = document.getElementById('sch-end-h').value;
          const endM = document.getElementById('sch-end-m').value;
          
          const startTime = startH + ':' + startM;
          const endTime = (endH && endM) ? endH + ':' + endM : '';
          
          const titleInput = document.getElementById('sch-title');
          const title = titleInput.value.trim();
          const category = document.getElementById('sch-cat').value;
          const desc = document.getElementById('sch-desc').value.trim();

          let isValid = true;
          if (!title) {
            document.getElementById('sch-title-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('sch-title-error').style.display = 'none';
            titleInput.style.borderColor = '';
          }

          if (!isValid) return false;

          try {
            await addScheduleItem({ day, startTime, endTime, title, category, desc });
            showToast('Đã thêm hoạt động', 'success');
            return true;
          } catch (e) {
            console.error(e);
            showToast('Lỗi khi thêm hoạt động', 'error');
            return false;
          }
        });
      },

      openEditModal(item) {
        if (!this.isOwnerOrAdmin(item.createdBy)) {
          showToast('Chỉ người tạo (hoặc Admin) mới có quyền sửa', 'error');
          return;
        }

        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Ngày</label>
              <select id="sch-day-edit" class="select">
                <option value="1" ${item.day === '1' ? 'selected' : ''}>Ngày 1 (30/05)</option>
                <option value="2" ${item.day === '2' ? 'selected' : ''}>Ngày 2 (31/05)</option>
              </select>
            </div>
            <div style="display: flex; gap: var(--space-4);">
              <div style="flex: 1;">
                <label style="display: block; margin-bottom: var(--space-2);">Giờ bắt đầu</label>
                <div style="display: flex; gap: var(--space-1); align-items: center;">
                  <select id="sch-start-h-edit" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getHourOptions(item.startTime ? item.startTime.split(':')[0] : '08')}
                  </select>
                  <span>:</span>
                  <select id="sch-start-m-edit" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getMinuteOptions(item.startTime ? item.startTime.split(':')[1] : '00')}
                  </select>
                </div>
              </div>
              <div style="flex: 1;">
                <label style="display: block; margin-bottom: var(--space-2);">Giờ kết thúc</label>
                <div style="display: flex; gap: var(--space-1); align-items: center;">
                  <select id="sch-end-h-edit" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getHourOptions(item.endTime ? item.endTime.split(':')[0] : '', true)}
                  </select>
                  <span>:</span>
                  <select id="sch-end-m-edit" class="select" style="padding: var(--space-2); flex: 1;">
                    ${this.getMinuteOptions(item.endTime ? item.endTime.split(':')[1] : '00')}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Tiêu đề hoạt động <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="sch-title-edit" class="input" value="${item.title}" required />
              <div id="sch-title-edit-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Vui lòng nhập tiêu đề hoạt động</div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Phân loại</label>
              <select id="sch-cat-edit" class="select">
                ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${item.category === k ? 'selected' : ''}>${v.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Ghi chú thêm</label>
              <textarea id="sch-desc-edit" class="textarea" rows="2">${item.desc || ''}</textarea>
            </div>
          </div>
        `;

        openModal('Sửa hoạt động', content, async () => {
          const day = document.getElementById('sch-day-edit').value;
          const startH = document.getElementById('sch-start-h-edit').value;
          const startM = document.getElementById('sch-start-m-edit').value;
          const endH = document.getElementById('sch-end-h-edit').value;
          const endM = document.getElementById('sch-end-m-edit').value;
          
          const startTime = startH + ':' + startM;
          const endTime = (endH && endM) ? endH + ':' + endM : '';
          
          const titleInput = document.getElementById('sch-title-edit');
          const title = titleInput.value.trim();
          const category = document.getElementById('sch-cat-edit').value;
          const desc = document.getElementById('sch-desc-edit').value.trim();

          let isValid = true;
          if (!title) {
            document.getElementById('sch-title-edit-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('sch-title-edit-error').style.display = 'none';
            titleInput.style.borderColor = '';
          }

          if (!isValid) return false;

          try {
            await updateScheduleItem(item.id, { day, startTime, endTime, title, category, desc });
            showToast('Đã cập nhật', 'success');
            return true;
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      async deleteItem(item) {
        if (!this.isOwnerOrAdmin(item.createdBy)) {
          showToast('Chỉ người tạo (hoặc Admin) mới có quyền xoá', 'error');
          return;
        }

        if (confirm('Bạn có chắc chắn muốn xoá hoạt động này?')) {
          try {
            await deleteScheduleItem(item.id);
            showToast('Đã xoá', 'success');
          } catch (e) {
            console.error(e);
            showToast('Lỗi khi xoá', 'error');
          }
        }
      }
    }));
  });

  return `
    <div x-data="scheduleComponent" style="position: relative; padding-bottom: var(--space-16);">
      
      <!-- Day Grid -->
      <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-8); @media(min-width: 768px) { grid-template-columns: 1fr 1fr; }">
        
        <!-- Ngày 1 -->
        <div>
          <div class="badge emerald" style="font-size: var(--fs-lg); margin-bottom: var(--space-6); padding: var(--space-2) var(--space-6);">Ngày 1 (30/05)</div>
          
          <div style="position: relative;">
            <template x-for="item in day1Items" :key="item.id">
              <div class="animate-fade-in" style="display: flex; gap: var(--space-4); margin-bottom: 0; position: relative; min-height: 100px;">
                <!-- Cột thời gian bên trái -->
                <div style="width: 70px; flex-shrink: 0; text-align: right; padding-top: 6px;">
                  <div style="font-weight: bold; font-family: var(--font-heading); font-size: var(--fs-xl); color: var(--emerald-400);" x-text="item.startTime"></div>
                  <div x-show="item.endTime" style="color: var(--text-secondary); font-size: var(--fs-sm); margin-top: 2px;" x-text="item.endTime"></div>
                </div>

                <!-- Trục thời gian ở giữa -->
                <div style="position: relative; width: 2px; background: rgba(52, 211, 153, 0.2); display: flex; justify-content: center;">
                  <!-- Dấu chấm tròn -->
                  <div style="position: absolute; top: 12px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--bg-deep);" 
                       :style="\`background: var(--\${getCategoryColor(item.category)}-400); box-shadow: 0 0 10px var(--\${getCategoryColor(item.category)}-400);\`">
                  </div>
                </div>

                <!-- Cột nội dung bên phải -->
                <div style="flex: 1; padding-bottom: var(--space-6);">
                  <div class="glass-card" style="padding: var(--space-4); margin-bottom: 0;" :style="\`border-left: 4px solid var(--\${getCategoryColor(item.category)}-400);\`">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                      <h3 style="font-size: var(--fs-lg); margin-bottom: 0;" x-text="item.title"></h3>
                      <div class="badge" :class="getCategoryColor(item.category)" x-text="getCategoryName(item.category)"></div>
                    </div>
                    
                    <p style="color: var(--text-secondary); font-size: var(--fs-sm); margin-bottom: var(--space-4);" x-show="item.desc" x-text="item.desc"></p>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: var(--space-2);">
                      <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--text-secondary);">
                        <span>Người tạo:</span>
                        <div class="avatar" style="width: 24px; height: 24px; font-size: 0.8rem; overflow: hidden;" x-html="window.renderAvatarHtml(getMemberAvatar(item.createdBy))"></div>
                        <strong style="color: var(--text-primary);" x-text="getMemberName(item.createdBy)"></strong>
                      </div>
                      <div style="display: flex; gap: var(--space-2);" x-show="isOwnerOrAdmin(item.createdBy)">
                        <button class="btn" @click="openEditModal(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--sky-400); border: 1px solid transparent;">Sửa</button>
                        <button class="btn" @click="deleteItem(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--coral-400); border: 1px solid transparent;">Xoá</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div x-show="day1Items.length === 0" style="padding: var(--space-4); color: var(--text-dim); text-align: center; font-style: italic;">
              Chưa có hoạt động nào. Hãy thêm hoạt động đầu tiên!
            </div>
          </div>
        </div>

        <!-- Ngày 2 -->
        <div>
          <div class="badge sky" style="font-size: var(--fs-lg); margin-bottom: var(--space-6); padding: var(--space-2) var(--space-6);">Ngày 2 (31/05)</div>
          
          <div style="position: relative;">
            <template x-for="item in day2Items" :key="item.id">
              <div class="animate-fade-in" style="display: flex; gap: var(--space-4); margin-bottom: 0; position: relative; min-height: 100px;">
                <!-- Cột thời gian bên trái -->
                <div style="width: 70px; flex-shrink: 0; text-align: right; padding-top: 6px;">
                  <div style="font-weight: bold; font-family: var(--font-heading); font-size: var(--fs-xl); color: var(--sky-400);" x-text="item.startTime"></div>
                  <div x-show="item.endTime" style="color: var(--text-secondary); font-size: var(--fs-sm); margin-top: 2px;" x-text="item.endTime"></div>
                </div>

                <!-- Trục thời gian ở giữa -->
                <div style="position: relative; width: 2px; background: rgba(56, 189, 248, 0.2); display: flex; justify-content: center;">
                  <!-- Dấu chấm tròn -->
                  <div style="position: absolute; top: 12px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--bg-deep);" 
                       :style="\`background: var(--\${getCategoryColor(item.category)}-400); box-shadow: 0 0 10px var(--\${getCategoryColor(item.category)}-400);\`">
                  </div>
                </div>

                <!-- Cột nội dung bên phải -->
                <div style="flex: 1; padding-bottom: var(--space-6);">
                  <div class="glass-card" style="padding: var(--space-4); margin-bottom: 0;" :style="\`border-left: 4px solid var(--\${getCategoryColor(item.category)}-400);\`">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                      <h3 style="font-size: var(--fs-lg); margin-bottom: 0;" x-text="item.title"></h3>
                      <div class="badge" :class="getCategoryColor(item.category)" x-text="getCategoryName(item.category)"></div>
                    </div>
                    
                    <p style="color: var(--text-secondary); font-size: var(--fs-sm); margin-bottom: var(--space-4);" x-show="item.desc" x-text="item.desc"></p>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: var(--space-2);">
                      <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--text-secondary);">
                        <span>Người tạo:</span>
                        <div class="avatar" style="width: 24px; height: 24px; font-size: 0.8rem; overflow: hidden;" x-html="window.renderAvatarHtml(getMemberAvatar(item.createdBy))"></div>
                        <strong style="color: var(--text-primary);" x-text="getMemberName(item.createdBy)"></strong>
                      </div>
                      <div style="display: flex; gap: var(--space-2);" x-show="isOwnerOrAdmin(item.createdBy)">
                        <button class="btn" @click="openEditModal(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--sky-400); border: 1px solid transparent;">Sửa</button>
                        <button class="btn" @click="deleteItem(item)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--coral-400); border: 1px solid transparent;">Xoá</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div x-show="day2Items.length === 0" style="padding: var(--space-4); color: var(--text-dim); text-align: center; font-style: italic;">
              Chưa có hoạt động nào. Hãy thêm hoạt động đầu tiên!
            </div>
          </div>
        </div>

      </div>

      <!-- Floating Add Button -->
      <button class="btn-primary" @click="openAddModal()" style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; font-size: 2rem; box-shadow: 0 10px 20px var(--glow-golden); z-index: 90; display: flex; align-items: center; justify-content: center;">
        +
      </button>

    </div>
  `;
}
