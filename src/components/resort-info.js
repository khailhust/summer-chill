import { RESORT_DATA, RESORT_IMAGES } from "../utils/constants.js";

export function renderResortInfo() {
  document.addEventListener('alpine:init', () => {
    Alpine.data('galleryComponent', () => ({
      images: RESORT_IMAGES,
      currentIndex: 0,
      interval: null,
      lightboxOpen: false,
      
      init() {
        this.startAutoSlide();
      },
      startAutoSlide() {
        this.interval = setInterval(() => {
          if (!this.lightboxOpen) this.next();
        }, 5000);
      },
      next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      },
      prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      },
      setIndex(index) {
        this.currentIndex = index;
      },
      openLightbox() {
        this.lightboxOpen = true;
        document.body.style.overflow = 'hidden';
      },
      closeLightbox() {
        this.lightboxOpen = false;
        document.body.style.overflow = 'auto';
      },
      handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
      },
      handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      },
      handleSwipe() {
        if (this.touchEndX < this.touchStartX - 50) this.next(); // swipe left -> next
        if (this.touchEndX > this.touchStartX + 50) this.prev(); // swipe right -> prev
      }
    }));
  });

  return `
    <section class="container" style="padding: var(--space-16) var(--space-4);" x-data="galleryComponent">
      <h2 style="font-size: var(--fs-4xl); font-family: var(--font-heading); color: var(--emerald-400); text-align: center; margin-bottom: var(--space-8); text-transform: uppercase; letter-spacing: 1px;" class="reveal-on-scroll">
        Khám phá <span style="color: var(--golden-400);">${RESORT_DATA.name}</span>
      </h2>

      <div class="resort-info-grid">
        
        <!-- Info Card -->
        <div class="glass-card reveal-on-scroll" style="display: flex; flex-direction: column; justify-content: center; padding: 2.5rem;">
          <h3 style="font-size: var(--fs-3xl); margin-bottom: var(--space-2); color: var(--golden-400); font-family: var(--font-heading);">${RESORT_DATA.name}</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--coral-400);">📍</span> ${RESORT_DATA.address}
          </p>
          
          <h4 style="margin-bottom: var(--space-4); color: var(--emerald-400); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Tiện ích nổi bật</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-4);">
            ${RESORT_DATA.amenities.map(a => `
              <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s;">
                <span style="font-size: 1.5rem; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${a.icon}</span>
                <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary); line-height: 1.3;">${a.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Gallery -->
        <div class="reveal-on-scroll" style="min-width: 0;">
          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 16/9; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" @click="openLightbox()">
            <img :src="images[currentIndex]" alt="Resort" style="width: 100%; height: 100%; object-fit: cover; transition: opacity var(--transition-normal);" loading="lazy" />
            
            <button class="btn-icon" @click.stop="prev()" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.2s; font-size: 1.2rem;">❮</button>
            <button class="btn-icon" @click.stop="next()" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.2s; font-size: 1.2rem;">❯</button>
          </div>
          
          <!-- Thumbnails -->
          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4); overflow-x: auto; padding-bottom: var(--space-4); scroll-behavior: smooth;">
            <template x-for="(img, index) in images" :key="index">
              <img :src="img" 
                   @click="setIndex(index)" 
                   style="width: 100px; height: 75px; min-width: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"
                   :style="{ 'border-color': currentIndex === index ? 'var(--emerald-400)' : 'transparent', 'opacity': currentIndex === index ? '1' : '0.4', 'transform': currentIndex === index ? 'scale(1.05)' : 'scale(1)' }"
                   loading="lazy" />
            </template>
          </div>
        </div>

      </div>

      <!-- Lightbox Modal -->
      <div x-show="lightboxOpen" style="display: none; position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.9); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center;" 
           @keydown.escape.window="closeLightbox()"
           @keydown.arrow-left.window="prev()"
           @keydown.arrow-right.window="next()"
           @touchstart="handleTouchStart"
           @touchend="handleTouchEnd">
        <button @click="closeLightbox()" style="position: absolute; top: 20px; right: 20px; color: white; font-size: 2rem; background: none; border: none; cursor: pointer;">×</button>
        
        <button class="btn-icon" @click.stop="prev()" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); color: white; font-size: 2rem; padding: 20px;">❮</button>
        
        <img :src="images[currentIndex]" style="max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: var(--radius-md);" />
        
        <button class="btn-icon" @click.stop="next()" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); color: white; font-size: 2rem; padding: 20px;">❯</button>

        <div style="position: absolute; bottom: 20px; color: white; font-family: var(--font-body);">
          <span x-text="currentIndex + 1"></span> / <span x-text="images.length"></span>
        </div>
      </div>
    </section>
  `;
}
