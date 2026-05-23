import { onPollsChange, addPoll, votePoll, deletePoll, addPollOption } from "../firebase/database.js";
import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

export function renderVoting() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('votingComponent', () => ({
      polls: [],

      init() {
        onPollsChange((data) => {
          this.polls = data.sort((a, b) => b.createdAt - a.createdAt);
        });
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

      getVoters(poll, optionIndex) {
        if (!poll.votes || !poll.votes[optionIndex]) return [];
        return Object.keys(poll.votes[optionIndex]);
      },

      hasVoted(poll, optionIndex) {
        const myUid = Alpine.store('app').user?.uid;
        return this.getVoters(poll, optionIndex).includes(myUid);
      },

      getVoteCount(poll, optionIndex) {
        return this.getVoters(poll, optionIndex).length;
      },

      getTotalVotes(poll) {
        if (!poll.votes) return 0;
        return Object.values(poll.votes).reduce((sum, votersObj) => sum + Object.keys(votersObj).length, 0);
      },

      getVotePercent(poll, optionIndex) {
        const total = this.getTotalVotes(poll);
        if (total === 0) return 0;
        return Math.round((this.getVoteCount(poll, optionIndex) / total) * 100);
      },

      async toggleVote(poll, optionIndex) {
        if (poll.status === 'closed') {
          showToast('Bình chọn đã đóng', 'info');
          return;
        }
        try {
          if (this.hasVoted(poll, optionIndex)) {
            // remove vote
            const { removeVote } = await import('../firebase/database.js');
            await removeVote(poll.id, optionIndex);
          } else {
            // add vote
            await votePoll(poll.id, optionIndex, poll.allowMultiple, poll.options.length);
          }
        } catch (e) {
          console.error(e);
        }
      },

      async addCustomOption(poll) {
        if (!poll.newOptionText) return;
        const text = poll.newOptionText.trim();
        if (!text) return;
        
        if (poll.options.includes(text)) {
          showToast('Lựa chọn này đã tồn tại', 'error');
          return;
        }

        try {
          const newIndex = poll.options.length;
          const { addPollOption } = await import('../firebase/database.js');
          await addPollOption(poll.id, newIndex, text);
          poll.newOptionText = ''; // Clear input
          showToast('Đã thêm lựa chọn mới', 'success');
        } catch (e) {
          console.error(e);
          showToast('Lỗi khi thêm lựa chọn', 'error');
        }
      },

      openAddModal() {
        const content = `
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Câu hỏi / Chủ đề <span style="color: var(--coral-400);">*</span></label>
              <input type="text" id="poll-title" class="input" placeholder="VD: Điểm hẹn xuất phát?" required />
              <div id="poll-title-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Vui lòng nhập câu hỏi / chủ đề</div>
            </div>
            <div>
              <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                <input type="checkbox" id="poll-multi" checked style="width: 20px; height: 20px; accent-color: var(--emerald-400);" />
                <span>Cho phép chọn nhiều phương án</span>
              </label>
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-2);">Các lựa chọn (Mỗi dòng 1 lựa chọn) <span style="color: var(--coral-400);">*</span></label>
              <textarea id="poll-options" class="textarea" rows="4" placeholder="Cổng ĐH Quốc Gia\nBigC Thăng Long\nTự túc" required></textarea>
              <div id="poll-options-error" style="color: var(--coral-400); font-size: var(--fs-xs); display: none; margin-top: 4px;">Cần ít nhất 2 phương án</div>
            </div>
          </div>
        `;

        openModal('Tạo bình chọn mới', content, async () => {
          const titleInput = document.getElementById('poll-title');
          const optionsInput = document.getElementById('poll-options');
          const title = titleInput.value.trim();
          const allowMultiple = document.getElementById('poll-multi').checked;
          const optionsText = optionsInput.value.trim();

          let isValid = true;

          if (!title) {
            document.getElementById('poll-title-error').style.display = 'block';
            titleInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('poll-title-error').style.display = 'none';
            titleInput.style.borderColor = '';
          }

          const options = optionsText.split('\n').map(o => o.trim()).filter(o => o);
          if (options.length < 2) {
            document.getElementById('poll-options-error').style.display = 'block';
            optionsInput.style.borderColor = 'var(--coral-400)';
            isValid = false;
          } else {
            document.getElementById('poll-options-error').style.display = 'none';
            optionsInput.style.borderColor = '';
          }

          if (!isValid) return false;

          try {
            await addPoll({ title, allowMultiple, options });
            showToast('Đã tạo bình chọn', 'success');
            return true;
          } catch (e) {
            console.error(e);
            return false;
          }
        });
      },

      async delPoll(poll) {
        if (!this.isOwnerOrAdmin(poll.createdBy)) {
          showToast('Chỉ người tạo (hoặc Admin) mới có quyền xoá', 'error');
          return;
        }
        if (confirm('Xoá bình chọn này?')) {
          try {
            await deletePoll(poll.id);
            showToast('Đã xoá', 'success');
          } catch (e) {
            console.error(e);
          }
        }
      }
    }));
  });

  return `
    <div x-data="votingComponent" style="max-width: 800px; margin: 0 auto; padding-bottom: var(--space-16);">
      
      <div class="voting-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
        <h2 style="font-size: var(--fs-2xl); color: var(--emerald-400);">Trưng cầu dân ý 🗳️</h2>
        <button class="btn btn-primary" @click="openAddModal()">+ Tạo bình chọn</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <template x-for="poll in polls" :key="poll.id">
          <div class="glass-card animate-fade-in" style="position: relative; overflow: hidden;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6);">
              <div>
                <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-2);">
                  <div class="badge" :class="poll.status === 'open' ? 'emerald' : 'coral'" x-text="poll.status === 'open' ? '🟢 Đang mở' : '🔴 Đã đóng'"></div>
                  <div class="badge sky" x-show="poll.allowMultiple">Nhiều lựa chọn</div>
                </div>
                <h3 style="font-size: var(--fs-2xl); color: var(--text-primary); font-family: var(--font-body); font-weight: bold;" x-text="poll.title"></h3>
              </div>
              
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span style="font-size: var(--fs-sm); color: var(--text-secondary);" x-text="getTotalVotes(poll) + ' votes'"></span>
                <button class="btn" @click="delPoll(poll)" x-show="isOwnerOrAdmin(poll.createdBy)" style="padding: 4px 8px; font-size: 12px; font-weight: normal; background: transparent; color: var(--coral-400); border: 1px solid transparent;">Xoá</button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <template x-for="(option, index) in poll.options" :key="index">
                
                <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 2px solid; transition: all var(--transition-fast);"
                     :style="hasVoted(poll, index) ? 'border-color: var(--emerald-400); background: rgba(52, 211, 153, 0.05);' : 'border-color: var(--border-glass); background: rgba(255,255,255,0.02);'"
                     @click="toggleVote(poll, index)">
                  
                  <!-- Progress Bar Background -->
                  <div style="position: absolute; top: 0; left: 0; height: 100%; transition: width 0.5s ease; opacity: 0.15; z-index: 1;"
                       :style="\`width: \${getVotePercent(poll, index)}%; background: \${hasVoted(poll, index) ? 'var(--emerald-400)' : 'var(--text-primary)'};\`">
                  </div>
                  
                  <!-- Content -->
                  <div style="position: relative; z-index: 2; padding: var(--space-3) var(--space-4); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: var(--space-4);">
                      <!-- Custom Checkbox/Radio -->
                      <div style="width: 24px; height: 24px; flex-shrink: 0; border: 2px solid; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                           :style="(poll.allowMultiple ? 'border-radius: 6px; ' : 'border-radius: 50%; ') + (hasVoted(poll, index) ? 'border-color: var(--emerald-400); background: var(--emerald-400);' : 'border-color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.2);')">
                        <span x-show="hasVoted(poll, index)" style="color: var(--bg-deep); font-size: 14px; font-weight: bold;">✓</span>
                      </div>
                      <span style="font-size: var(--fs-lg);" :style="hasVoted(poll, index) ? 'color: var(--emerald-400); font-weight: 600;' : 'color: var(--text-primary);'" x-text="option"></span>
                    </div>

                    <div style="display: flex; align-items: center; gap: var(--space-4);">
                      <!-- Voter Avatars -->
                      <div class="navbar-members" style="transform: scale(0.8);" x-show="getVoteCount(poll, index) > 0">
                        <template x-for="voterUid in getVoters(poll, index)" :key="voterUid">
                          <div class="avatar" style="width: 32px; height: 32px; overflow: hidden;" :title="getMemberName(voterUid)">
                            <div style="width: 100%; height: 100%; border-radius: 50%;" x-html="window.renderAvatarHtml(getMemberAvatar(voterUid))"></div>
                          </div>
                        </template>
                      </div>
                      
                      <!-- Count -->
                      <div style="font-weight: bold; min-width: 40px; text-align: right;" :style="hasVoted(poll, index) ? 'color: var(--emerald-400);' : 'color: var(--text-secondary);'">
                        <span x-text="getVotePercent(poll, index) + '%'"></span>
                      </div>
                    </div>
                  </div>
                </div>

              </template>
            </div>

            <!-- Add custom option -->
            <div x-show="poll.status === 'open'" style="margin-top: 16px; padding: 12px; background: rgba(0,0,0,0.1); border-radius: var(--radius-md); border: 1px dashed var(--border-glass);">
              <input type="text" class="input" style="width: 100%; padding: 10px 12px; font-size: var(--fs-sm); background: rgba(255,255,255,0.05); border: 1px solid transparent; border-radius: var(--radius-sm);" placeholder="Thêm lựa chọn khác..." x-model="poll.newOptionText" @keydown.enter="addCustomOption(poll)">
              <div style="text-align: right; margin-top: 12px;" x-show="poll.newOptionText && poll.newOptionText.trim().length > 0">
                <button class="btn" style="padding: 8px 20px; font-size: var(--fs-sm); font-weight: bold; background: rgba(52, 211, 153, 0.15); color: var(--emerald-400); border: 1px solid var(--emerald-400);" @click="addCustomOption(poll)">Thêm</button>
              </div>
            </div>

            <div style="margin-top: var(--space-4); font-size: var(--fs-xs); color: var(--text-secondary); display: flex; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span>Tạo bởi:</span>
                <div class="avatar" style="width: 20px; height: 20px; font-size: 0.7rem; overflow: hidden;" x-html="window.renderAvatarHtml(getMemberAvatar(poll.createdBy))"></div>
                <strong style="color: var(--text-primary);" x-text="getMemberName(poll.createdBy)"></strong>
              </div>
            </div>
            
          </div>
        </template>

        <div x-show="polls.length === 0" style="text-align: center; color: var(--text-dim); padding: var(--space-8); font-style: italic;">
          Chưa có cuộc bình chọn nào.
        </div>
      </div>

    </div>
  `;
}
