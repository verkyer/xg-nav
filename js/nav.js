// 全局变量
let allLinks = [];
let config = {};
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM元素
const navContainer = document.getElementById('nav-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchClear = document.getElementById('search-clear');
const searchEngineSelect = document.getElementById('search-engine-select');
const searchResultsCount = document.getElementById('search-results-count');
const themeToggle = document.getElementById('theme-toggle');
const backToTop = document.getElementById('back-to-top');

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 设置初始主题
    setTheme(currentTheme);
    
    // 加载配置和链接数据
    await Promise.all([
      loadConfig(),
      loadLinks()
    ]);
    
    // 渲染页面
    renderLinks(allLinks);
    
    // 绑定事件
    bindEvents();
    
    // 初始化搜索引擎图标
    updateSearchEngineIcon();
    
  } catch (error) {
    console.error('初始化失败:', error);
    showError('加载失败，请刷新页面重试');
  }
});

// 加载配置文件
async function loadConfig() {
  try {
    const response = await fetch('config.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    config = await response.json();
    
    // 更新页面标题和描述
    if (config.SITE_TITLE) {
      document.title = config.SITE_TITLE;
      document.querySelector('header h1').textContent = config.SITE_TITLE;
    }
    
    if (config.SITE_DESCRIPTION) {
      document.querySelector('meta[name="description"]').setAttribute('content', config.SITE_DESCRIPTION);
    }
    
    if (config.COPYRIGHT) {
      document.querySelector('footer small').innerHTML = config.COPYRIGHT;
    }
    
  } catch (error) {
    console.warn('配置文件加载失败，使用默认配置:', error);
    config = {
      SITE_TITLE: 'XG🧭导航',
      SITE_DESCRIPTION: '一个简洁、纯静态的个人导航站',
      COPYRIGHT: '© 2025 <a href="https://github.com/verkyer/xg-nav" target="_blank">XG-Nav</a>',
      CARD_CONTENT: 1
    };
  }
}

// 加载链接数据
async function loadLinks() {
  try {
    const response = await fetch('data/links.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    allLinks = parseLinks(text);
  } catch (error) {
    console.error('链接数据加载失败:', error);
    throw error;
  }
}

// 解析链接数据
function parseLinks(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  return lines.map(line => {
    const parts = line.split(',');
    if (parts.length >= 4) {
      return {
        name: parts[0].trim(),
        description: parts[1].trim(),
        url: parts[2].trim(),
        category: parts[3].trim()
      };
    }
    return null;
  }).filter(link => link !== null);
}

// 渲染链接
function renderLinks(links) {
  if (!links || links.length === 0) {
    showError('暂无链接数据');
    return;
  }
  
  // 按分类分组
  const groupedLinks = groupLinksByCategory(links);
  
  // 生成HTML
  let html = '';
  
  for (const [category, categoryLinks] of Object.entries(groupedLinks)) {
    html += `<div class="category-title">${category}</div>`;
    
    categoryLinks.forEach(link => {
      html += createLinkCard(link);
    });
  }
  
  navContainer.innerHTML = html;
  
  // 更新搜索结果计数
  updateSearchResultsCount(links.length, allLinks.length);
}

// 按分类分组链接
function groupLinksByCategory(links) {
  const grouped = {};
  
  links.forEach(link => {
    const category = link.category || '其他';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(link);
  });
  
  // 排序分类
  const sortedGrouped = {};
  Object.keys(grouped).sort().forEach(key => {
    sortedGrouped[key] = grouped[key];
  });
  
  return sortedGrouped;
}

// 创建链接卡片
function createLinkCard(link) {
  const showDescription = config.CARD_CONTENT !== 0;
  
  return `
    <a href="${link.url}" target="_blank" class="link-card" rel="noopener noreferrer">
      <h3>${link.name}</h3>
      ${showDescription ? `<p>${link.description}</p>` : ''}
    </a>
  `;
}

// 搜索功能
function searchLinks(query) {
  if (!query.trim()) {
    renderLinks(allLinks);
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const filteredLinks = allLinks.filter(link => {
    return link.name.toLowerCase().includes(searchTerm) ||
           link.description.toLowerCase().includes(searchTerm) ||
           link.category.toLowerCase().includes(searchTerm) ||
           link.url.toLowerCase().includes(searchTerm);
  });
  
  if (filteredLinks.length === 0) {
    showNoResults(query);
  } else {
    renderLinks(filteredLinks);
  }
}

// 显示无搜索结果
function showNoResults(query) {
  navContainer.innerHTML = `
    <div class="no-results">
      <h3>未找到相关结果</h3>
      <p>没有找到包含 "${query}" 的链接，请尝试其他关键词。</p>
    </div>
  `;
  updateSearchResultsCount(0, allLinks.length);
}

// 更新搜索结果计数
function updateSearchResultsCount(current, total) {
  if (current === total) {
    searchResultsCount.textContent = '';
    searchResultsCount.classList.remove('show');
  } else {
    searchResultsCount.textContent = `找到 ${current} 个结果，共 ${total} 个链接`;
    searchResultsCount.classList.add('show');
  }
}

// 执行搜索引擎搜索
function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  const selectedEngine = searchEngineSelect.value;
  const searchUrl = searchEngineSelect.querySelector(`option[value="${selectedEngine}"]`).dataset.url;
  
  // 检查是否是URL
  if (isValidUrl(query)) {
    window.open(query, '_blank');
  } else {
    window.open(searchUrl + encodeURIComponent(query), '_blank');
  }
}

// 验证URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // 检查是否是简单的域名格式
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (domainRegex.test(string)) {
      return true;
    }
    return false;
  }
}

// 更新搜索引擎图标
function updateSearchEngineIcon() {
  const selectedEngine = searchEngineSelect.value;
  const iconPath = `ico/${selectedEngine}.png`;
  
  // 创建或更新图标
  let icon = searchEngineSelect.parentElement.querySelector('.search-engine-icon');
  if (!icon) {
    icon = document.createElement('img');
    icon.className = 'search-engine-icon';
    icon.style.cssText = `
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      pointer-events: none;
    `;
    searchEngineSelect.parentElement.style.position = 'relative';
    searchEngineSelect.parentElement.appendChild(icon);
    searchEngineSelect.style.paddingLeft = '32px';
  }
  
  icon.src = iconPath;
  icon.alt = selectedEngine;
}

// 主题切换
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// 返回顶部功能
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// 显示/隐藏返回顶部按钮
function toggleBackToTopButton() {
  if (window.pageYOffset > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

// 显示错误信息
function showError(message) {
  navContainer.innerHTML = `
    <div class="error">
      <h3>⚠️ 加载失败</h3>
      <p>${message}</p>
    </div>
  `;
}

// 绑定事件
function bindEvents() {
  // 搜索相关事件
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    // 显示/隐藏清空按钮
    if (query) {
      searchClear.classList.add('show');
    } else {
      searchClear.classList.remove('show');
    }
    
    // 实时搜索
    searchLinks(query);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  searchButton.addEventListener('click', performSearch);
  
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('show');
    searchLinks('');
    searchInput.focus();
  });
  
  searchEngineSelect.addEventListener('change', updateSearchEngineIcon);
  
  // 主题切换
  themeToggle.addEventListener('click', toggleTheme);
  
  // 返回顶部
  backToTop.addEventListener('click', scrollToTop);
  
  // 滚动事件
  window.addEventListener('scroll', toggleBackToTopButton);
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    
    // ESC 清空搜索
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      searchClear.classList.remove('show');
      searchLinks('');
      searchInput.blur();
    }
  });
  
  // 防止表单提交
  document.querySelector('.search-box').addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
  });
}

// 性能优化：防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 性能优化：节流函数
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// 导出函数供测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseLinks,
    groupLinksByCategory,
    isValidUrl,
    searchLinks
  };
}