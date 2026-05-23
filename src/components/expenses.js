import { onExpensesChange, addExpense, deleteExpense } from "../firebase/database.js";
import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

const EXPENSE_CATEGORIES = {
  food: { name: 'Ăn uống', icon: '🍔' },
  transport: { name: 'Di chuyển', icon: '🚗' },
  stay: { name: 'Chỗ ở', icon: '🏠' },
  activity: { name: 'Vui chơi', icon: '🎟️' },
  other: { name: 'Khác', icon: '🛒' }
};

export function renderExpenses() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('expensesComponent', () => ({
      expenses: [],

      init() {
        onExpensesChange((data) => {
          this.expenses = data.sort((a, b) => b.createdAt - a.createdAt);
        });
      },

      get totalAmount() {
        return this.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      },

      get memberCount() {
        return Object.keys(Alpine.store('app').members || {}).length || 1;
      },

      get perPerson() {
        if (this.memberCount === 0) return 0;
        return this.totalAmount / this.memberCount;
      },

      formatVND(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
      },

      getMemberAvatar(uid) {
        return Alpine.store('app').members[uid]?.avatar || '👤';
      },
      
      getMemberName(uid) {
        return Alpine.store('app').members[uid]?.name || 'Khách';
      },

      isOwnerOrAdmin(uid) {
        const app = Alpine.store('app');
        return app.isAdmin || (app.user?.uid === uid);
      },

      getCategoryIcon(catId) {
        return EXPENSE_CATEGORIES[catId]?.icon || '🛒';
      },

      openAddModal() {
        const myUid = Alpine.store('app').user?.uid;
        
        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Tên khoản chi <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="exp-title" class="input" placeholder="VD: Tiền homestay, Tiền thịt nướng..." required />
              <div id="exp-title-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Vui lòng nhập tên khoản chi</div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Số tiền (VNĐ) <span style="color: var(--coral-400);">*</span></label>
              <input type="number" id="exp-amount" class="input" placeholder="500000" min="0" step="1000" required />
              <div id="exp-amount-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Vui lòng nhập số tiền lớn hơn 0</div>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Người trả</label>
              <select id="exp-payer" class="select">
                <template x-data x-for="[uid, m] in Object.entries($store.app.members)" :key="uid">
                  <option :value="uid" :selected="uid === '${myUid}'" x-text="m.name"></option>
                </template>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Phân loại</label>
              <select id="exp-cat" class="select">
                ${Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
              </select>
            </div>
          </div>
        `;

        openModal('Thêm khoản chi', content, async () => {
          const titleInput = document.getElementById('exp-title');
          const amountInput = document.getElementById('exp-amount');
          const title = titleInput.value.trim();
          const amount = parseInt(amountInput.value, 10);
          const paidBy = document.getElementById('exp-payer').value;
          const category = document.getElementById('exp-cat').value;

          let isValid = true;
          
          if (!title) {
            document.getElementById('exp-title-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('exp-title-error').style.display = 'none';
            titleInput.style.borderColor = '';
          }

          if (isNaN(amount) || amount <= 0) {
            document.getElementById('exp-amount-error').style.display = 'block';
            amountInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('exp-amount-error').style.display = 'none';
            amountInput.style.borderColor = '';
          }

          if (!isValid) return false;

          try {
            await addExpense({ title, amount, paidBy, category });
            showToast('Đã thêm khoản chi', 'success');
            return true;
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      async delExpense(expense) {
        if (!this.isOwnerOrAdmin(expense.createdBy)) {
          showToast('Chỉ người tạo (hoặc Admin) mới có thể xoá', 'error');
          return;
        }

        if (confirm('Xoá khoản chi này?')) {
          try {
            await deleteExpense(expense.id);
            showToast('Đã xoá', 'success');
          } catch (e) {
            console.error(e);
          }
        }
      }
    }));
  });

  return `
    <div x-data="expensesComponent" style="max-width: 800px; margin: 0 auto; padding-bottom: var(--space-16);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--fs-2xl); color: var(--emerald-400);">Quỹ chung 💰</h2>
        <button class="btn btn-primary" @click="openAddModal()">+ Thêm khoản chi</button>
      </div>

      <!-- Summary Board -->
      <div class="glass-card" style="margin-bottom: var(--space-8); background: linear-gradient(135deg, rgba(30,50,30,0.8), rgba(15,31,15,0.9)); border-top: 4px solid var(--coral-400);">
        <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-4); @media(min-width: 768px) { grid-template-columns: 1fr 1fr; }">
          
          <div style="text-align: center; border-right: 1px solid var(--border-glass);">
            <p style="color: var(--text-secondary); font-size: var(--fs-sm); text-transform: uppercase;">Tổng chi phí</p>
            <p style="font-size: var(--fs-4xl); color: var(--coral-400); font-family: var(--font-heading); font-weight: bold;" x-text="formatVND(totalAmount)"></p>
          </div>
          
          <div style="text-align: center;">
            <p style="color: var(--text-secondary); font-size: var(--fs-sm); text-transform: uppercase;">Mỗi người (chia đều <span x-text="memberCount"></span> người)</p>
            <p style="font-size: var(--fs-3xl); color: var(--golden-400); font-family: var(--font-heading); font-weight: bold;" x-text="formatVND(perPerson)"></p>
          </div>

        </div>
        
        <div class="badge sky" style="margin-top: var(--space-4); justify-content: center; text-align: center;">
          💡 Tính năng chia tiền chi tiết (ai nợ ai) sẽ được mở khoá sau khi kết thúc chuyến đi!
        </div>
      </div>

      <!-- Transaction List -->
      <div>
        <h3 style="margin-bottom: var(--space-4); color: var(--text-primary); border-bottom: 1px solid var(--border-glass); padding-bottom: var(--space-2);">Lịch sử chi tiêu</h3>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <template x-for="exp in expenses" :key="exp.id">
            <div class="glass-card animate-fade-in" style="padding: var(--space-3) var(--space-4); display: flex; justify-content: space-between; align-items: center;">
              
              <div style="display: flex; align-items: center; gap: var(--space-4);">
                <div style="font-size: 2rem; width: 40px; text-align: center;" x-text="getCategoryIcon(exp.category)"></div>
                <div>
                  <div style="font-weight: 500; font-size: var(--fs-lg);" x-text="exp.title"></div>
                  <div style="font-size: var(--fs-sm); color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                    Người trả: 
                    <div class="avatar" style="width: 18px; height: 18px; font-size: 10px; overflow: hidden;">
                      <div style="width: 100%; height: 100%; border-radius: 50%;" x-html="window.renderAvatarHtml(getMemberAvatar(exp.paidBy))"></div>
                    </div> 
                    <span x-text="getMemberName(exp.paidBy)"></span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--space-4);">
                <div style="font-size: var(--fs-xl); font-weight: bold; color: var(--coral-400);" x-text="formatVND(exp.amount)"></div>
                <button class="btn" @click="delExpense(exp)" x-show="isOwnerOrAdmin(exp.createdBy)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--coral-400); border: 1px solid transparent;">Xoá</button>
              </div>

            </div>
          </template>

          <div x-show="expenses.length === 0" style="text-align: center; color: var(--text-dim); padding: var(--space-8); font-style: italic;">
            Chưa có khoản chi nào được ghi nhận.
          </div>
        </div>
      </div>

    </div>
  `;
}
