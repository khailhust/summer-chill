import { MUSIC_URL } from "../utils/constants.js";

export function renderMusicPlayer() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('musicPlayer', () => ({
      isPlaying: false,
      hasInteracted: false,
      audioUrl: MUSIC_URL,
      
      init() {
        this.audio = new Audio(this.audioUrl);
        this.audio.loop = true;
        this.audio.volume = 0.4; // Đặt âm lượng vừa phải

        // Tự động phát khi người dùng tương tác lần đầu với trang
        const playOnInteract = () => {
          if (!this.hasInteracted) {
            this.audio.play().then(() => {
              this.isPlaying = true;
              this.hasInteracted = true;
              // Chỉ xoá sự kiện khi đã phát thành công
              document.removeEventListener('click', playOnInteract);
              document.removeEventListener('touchend', playOnInteract);
            }).catch(e => {
              console.warn("Autoplay chưa sẵn sàng, đợi thao tác click tiếp theo.", e);
            });
          }
        };

        document.addEventListener('click', playOnInteract);
        document.addEventListener('touchend', playOnInteract);
      },

      toggle() {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      },

      play() {
        // Trình duyệt yêu cầu phải catch lỗi autoplay
        this.audio.play().then(() => {
          this.isPlaying = true;
        }).catch(e => {
          console.warn("Autoplay bị chặn bởi trình duyệt. Đợi người dùng click.", e);
        });
      },

      pause() {
        this.audio.pause();
        this.isPlaying = false;
      }
    }));
  });

  return `
    <div x-data="musicPlayer" style="position: fixed; bottom: 20px; left: 20px; z-index: 9999; display: flex; align-items: center; gap: var(--space-3); background: var(--bg-glass); backdrop-filter: blur(10px); padding: var(--space-2) var(--space-4) var(--space-2) var(--space-2); border-radius: 50px; border: 1px solid var(--border-glass); box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all var(--transition-fast);" :style="{ 'border-color': isPlaying ? 'var(--emerald-400)' : 'var(--border-glass)' }">
      
      <!-- Đĩa than xoay -->
      <button @click="toggle()" class="vinyl-record" :class="isPlaying ? 'spin-anim' : ''" style="width: 40px; height: 40px; min-width: 40px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; border: 2px solid #333;" title="Phát / Tạm dừng nhạc">
        <!-- Rãnh đĩa -->
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 1px solid #222;"></div>
        <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #222;"></div>
        <!-- Tâm đĩa -->
        <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--coral-400); z-index: 2; border: 2px solid #000; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
        <!-- Điểm phản quang giả -->
        <div style="position: absolute; top: -50%; left: 50%; width: 2px; height: 200%; background: linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.2) 100%); transform: rotate(45deg);"></div>
      </button>

      <!-- Text -->
      <div style="display: flex; flex-direction: column; cursor: pointer;" @click="toggle()">
        <span style="font-size: 10px; color: var(--text-secondary); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; transition: color var(--transition-fast);" :style="{ 'color': isPlaying ? 'var(--emerald-400)' : 'var(--text-secondary)' }" x-text="isPlaying ? 'Đang phát' : 'Đã tạm dừng'"></span>
        <span style="font-size: 14px; color: var(--text-primary); font-family: var(--font-heading); margin-top: -2px;">Lofi Chill Vibe</span>
      </div>

    </div>

    <style>
      .spin-anim {
        animation: spin 3s linear infinite;
      }
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}
