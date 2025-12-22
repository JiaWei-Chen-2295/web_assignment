class AppBase {
  constructor() {
    this.data = null;
    this.toast = null;
  }

  showToast(message, type = 'info') {
    if (this.toast) this.toast.show(message, type);
  }

  closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.remove());
  }

  applyTheme() {
    const isDark = this.data?.user?.theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
  }

  toggleTheme() {
    const theme = this.data?.user?.theme === 'dark' ? 'light' : 'dark';
    this.data.user.theme = theme;
    DataAPI.save(this.data);
    this.applyTheme();
    this.showToast(`切换到${theme === 'dark' ? '暗色' : '亮色'}主题`, 'info');
  }

  createBackup(type = 'manual') {
    const raw = localStorage.getItem('yuque-lite-backups');
    const backups = raw ? JSON.parse(raw) : [];
    backups.unshift({
      timestamp: Date.now(),
      type: type,
      data: JSON.parse(JSON.stringify(this.data))
    });
    if (backups.length > 5) backups.splice(5);
    localStorage.setItem('yuque-lite-backups', JSON.stringify(backups));
    this.showToast(`备份已创建 (${type})`, 'success');
  }
}

globalThis.AppBase = AppBase;
