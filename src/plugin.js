class StatusExtension {
  constructor() {
    this.statusData = [];
    this.currentCharacter = null;
    this.lang = this.loadLanguage('zh-CN');
  }

  // 初始化插件
  async initialize() {
    this.injectStyles();
    this.createUI();
    this.registerEvents();
    await this.loadCharacterData();
  }

  // 注入样式
  injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('src/styles.css');
    document.head.appendChild(link);
  }

  // 创建主界面
  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'st-status-container';
    this.container.innerHTML = `
      <div class="status-header">
        <h3>${this.lang.currentCharacter}<span id="st-current-char">未选择</span></h3>
        <div class="toolbar">
          <button class="st-btn" id="st-add-status">${this.lang.addStatus}</button>
          <button class="st-btn" id="st-settings">${this.lang.settings}</button>
        </div>
      </div>
      <div id="st-status-list"></div>
    `;
    
    document.querySelector('.main-container').appendChild(this.container);
    this.bindEvents();
  }

  // 绑定事件
  bindEvents() {
    document.getElementById('st-add-status').addEventListener('click', () => this.showAddDialog());
    document.getElementById('st-settings').addEventListener('click', () => this.openSettings());
    
    // 监听角色切换
    window.addEventListener('characterSelected', (e) => {
      this.currentCharacter = e.detail;
      this.loadCharacterData();
    });
  }

  // 加载角色数据
  async loadCharacterData() {
    if (this.currentCharacter?.customData?.status) {
      this.statusData = JSON.parse(this.currentCharacter.customData.status);
      this.renderStatus();
    }
  }

  // 保存数据到角色卡
  saveToCharacter() {
    if (this.currentCharacter) {
      this.currentCharacter.customData = this.currentCharacter.customData || {};
      this.currentCharacter.customData.status = JSON.stringify(this.statusData);
      window.saveCharacter(this.currentCharacter);
    }
  }

  // 渲染状态列表
  renderStatus() {
    const container = document.getElementById('st-status-list');
    container.innerHTML = '';

    this.statusData.forEach((status, index) => {
      const percent = (status.current / status.max * 100).toFixed(1);
      const item = document.createElement('div');
      item.className = 'st-status-item';
      item.innerHTML = `
        <div class="st-progress" style="background-color: ${status.color}22">
          <div class="st-progress-bar" style="width: ${percent}%; background: ${status.color}">
            <span class="st-progress-text">${status.name} ${status.current}/${status.max}</span>
          </div>
        </div>
        <div class="st-controls">
          <input type="range" min="0" max="${status.max}" value="${status.current}"
                 oninput="statusExtension.updateStatus(${index}, this.value)">
          <button class="st-icon-btn" onclick="statusExtension.removeStatus(${index})">🗑️</button>
        </div>
      `;
      container.appendChild(item);
    });
  }
}

// 初始化插件实例
const statusExtension = new StatusExtension();

// 注册插件加载事件
window.addEventListener('st-loaded', () => {
  statusExtension.initialize();
});
