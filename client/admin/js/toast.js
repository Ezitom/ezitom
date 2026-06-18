/**
 * toast.js - Shared toast notification helper
 */

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
  const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)' };

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.success} toast-icon" style="color:${colors[type]||colors.success};"></i>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
