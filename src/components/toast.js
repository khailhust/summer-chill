export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `glass-card animate-fade-up`;
  toast.style.padding = 'var(--space-3) var(--space-4)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = 'var(--space-2)';
  toast.style.minWidth = '250px';

  let icon = 'ℹ️';
  let borderColor = 'var(--sky-400)';
  
  if (type === 'success') {
    icon = '✅';
    borderColor = 'var(--emerald-400)';
  } else if (type === 'error') {
    icon = '❌';
    borderColor = 'var(--coral-400)';
  }

  toast.style.borderLeft = `4px solid ${borderColor}`;

  toast.innerHTML = `
    <span>${icon}</span>
    <span style="font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all var(--transition-normal)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
