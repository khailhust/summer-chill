export function openModal(title, contentHtml, onConfirm = null, confirmText = 'Xác nhận', onCancel = null) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(15, 31, 15, 0.8)';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity var(--transition-normal)';
  overlay.id = 'active-modal';

  const modal = document.createElement('div');
  modal.className = 'glass-card';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.transform = 'scale(0.95)';
  modal.style.transition = 'transform var(--transition-normal)';
  modal.style.position = 'relative';

  let footerHtml = '';
  if (onConfirm) {
    footerHtml = `
      <div style="display: flex; justify-content: flex-end; gap: var(--space-4); margin-top: var(--space-6);">
        <button class="btn btn-secondary" id="modal-cancel">Huỷ</button>
        <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
      </div>
    `;
  } else {
    // Just a close button
    footerHtml = `
      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-6);">
        <button class="btn btn-primary" id="modal-cancel">Đóng</button>
      </div>
    `;
  }

  modal.innerHTML = `
    <h2 style="margin-bottom: var(--space-4); color: var(--golden-400); font-family: var(--font-heading);">${title}</h2>
    <div>${contentHtml}</div>
    ${footerHtml}
  `;

  overlay.appendChild(modal);
  container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  });

  const closeModal = () => {
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  };

  const handleCancel = () => {
    if (onCancel) {
      if (onCancel() !== false) closeModal();
    } else {
      closeModal();
    }
  };

  // Event listeners
  document.getElementById('modal-cancel')?.addEventListener('click', handleCancel);
  document.getElementById('modal-confirm')?.addEventListener('click', async () => {
    if (onConfirm) {
      // If onConfirm returns false, don't close (e.g. validation failed)
      const shouldClose = await onConfirm();
      if (shouldClose !== false) closeModal();
    } else {
      closeModal();
    }
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handleCancel();
  });

  // Close on ESC
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

export function closeModal() {
  const overlay = document.getElementById('active-modal');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }
}
