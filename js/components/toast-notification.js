// 4. Toast 通知系统
class ToastNotification extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timeout = null;
  }

  show(message, type = 'info', duration = 3000) {
    const iconName = type === 'success'
      ? 'lucide:check'
      : type === 'error'
        ? 'lucide:x'
        : type === 'warning'
          ? 'lucide:alert-triangle'
          : 'lucide:info';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: fixed; top: 70px; right: 20px; z-index: 10000; }
        .toast {
          background: var(--bg, #FFFFFF);
          padding: 10px 14px; border-radius: 4px;
          border: 1px solid var(--border, #E5E7EB);
          display: flex; align-items: center; gap: 8px;
          min-width: 220px; font-size: 13px; margin-bottom: 8px;
          border-left: 3px solid var(--primary, #10B981);
        }
        .toast.success { border-left-color: var(--primary, #10B981); }
        .toast.error { border-left-color: var(--border-hover, #D1D5DB); }
        .toast.warning { border-left-color: var(--border-hover, #D1D5DB); }
        .toast.info { border-left-color: var(--text-muted, #6B7280); }
      </style>
      <div class="toast ${type}">
        <span class="iconify" data-icon="${iconName}" data-width="14"></span>
        <span>${message}</span>
      </div>
    `;
    this.scanIcons();

    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  scanIcons() {
    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(this.shadowRoot);
    }
  }

  hide() {
    this.shadowRoot.innerHTML = '';
  }
}

customElements.define('toast-notification', ToastNotification);
