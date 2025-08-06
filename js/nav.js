// 全局变量
let allLinks = [];
let siteConfig = {};
let currentSearchEngine = {
  name: 'Bing',
  engine: 'bing',
  url: 'https://www.bing.com/search?q='
};
const domCache = {};

// 加载网站配置
async function loadSiteConfig() {
  // 设置默认配置
  const defaultConfig = {
    SITE_TITLE: 'XG🧭导航',
    SITE_DESCRIPTION: '一个简洁、纯静态的个人导航站',
    COPYRIGHT: '© 2025 <a href="https://github.com/verkyer/xg-nav" target="_blank">XG-Nav</a>',
    CARD_CONTENT: 0
  };
  
  let config = defaultConfig;
  
  try {
    const response = await fetch('config.json');
    if (response.ok) {
      const loadedConfig = await response.json();
      // 合并配置，优先使用加载的配置
      config = { ...defaultConfig, ...loadedConfig };
    }
  } catch (e) {
    console.error('加载网站配置失败，使用默认配置:', e);
  }
  
  siteConfig = config; // 保存配置到全局变量
  
  // 设置页面标题，如果有描述则作为副标题
  const pageTitle = config.SITE_DESCRIPTION ? 
    `${config.SITE_TITLE} - ${config.SITE_DESCRIPTION}` : 
    config.SITE_TITLE;
  document.title = pageTitle;
  
  const h1Element = document.querySelector('header h1');
  if (h1Element) {
    h1Element.textContent = config.SITE_TITLE;
  }
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = config.SITE_DESCRIPTION;
  }
  
  const footerElement = document.querySelector('footer small');
  if (footerElement) {
    footerElement.innerHTML = config.COPYRIGHT;
  }
  
  return true;
}

// 加载链接数据
async function loadLinks() {
  const navContainer = document.getElementById('nav-container');
  
  try {
    // 使用更轻量的加载提示
    navContainer.innerHTML = '<div class="loading">⚡</div>';
    
    // 移除缓存破坏参数，让浏览器缓存生效
    const response = await fetch('data/links.txt');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const txt = await response.text();
    const lines = txt.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
    
    // 优化数据处理，减少内存分配
    const data = [];
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 3) {
        data.push({
          title: parts[0].trim(),
          description: parts[1].trim(),
          url: parts[2].trim(),
          category: parts[3] ? parts[3].trim() : '未分类'
        });
      }
    }
    
    allLinks = data;
    
    // 使用requestAnimationFrame优化渲染时机
    requestAnimationFrame(() => render(data));
    
  } catch (e) {
    console.error('加载链接失败:', e);
    navContainer.innerHTML = 
      '<div class="error-message"><p>😢 加载链接失败</p><button onclick="loadLinks()">重试</button></div>';
  }
}

// 渲染链接
function render(list) {
  const wrap = domCache.navContainer || (domCache.navContainer = document.getElementById('nav-container'));
  
  // 获取卡片内容显示配置，默认为0（显示描述）
  const showUrl = siteConfig.CARD_CONTENT === 1;
  
  // 使用对象而非Map，性能更好
  const group = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const category = item.category;
    if (!group[category]) {
      group[category] = [];
    }
    group[category].push(item);
  }
  
  // 使用数组拼接而非模板字符串，减少内存分配
  const sections = [];
  for (const category in group) {
    const links = group[category];
    sections.push('<section><h2>', category, '</h2><ul>');
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      sections.push(
        '<li data-url="', link.url, '">',
        '<a href="', link.url, '" target="_blank" rel="noopener" class="card-title">', link.title, '</a>',
        '<div class="url">', showUrl ? link.url : link.description, '</div>',
        '</li>'
      );
    }
    
    sections.push('</ul></section>');
  }
  
  wrap.innerHTML = sections.join('');
  
  if (!domCache.cardClickHandlerAdded) {
    wrap.addEventListener('click', handleCardClick);
    domCache.cardClickHandlerAdded = true;
  }
}

// 处理卡片点击
function handleCardClick(e) {
  const card = e.target.closest('li[data-url]');
  if (!card) return;
  if (e.target.tagName === 'A') return;
  
  window.open(card.dataset.url, '_blank');
}

// 资源预加载已在HTML中实现

// 预初始化搜索引擎选择器，避免图标延迟
document.addEventListener('DOMContentLoaded', () => {
  const searchEngineSelect = document.getElementById('search-engine-select');
  if (searchEngineSelect) {
    // 立即设置默认图标，避免等待
    searchEngineSelect.setAttribute('value', 'bing');
  }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  } else {
    document.body.setAttribute('data-theme', 
      matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
  }
  
  // 恢复保存的搜索引擎设置
  const savedSearchEngine = localStorage.getItem('searchEngine');
  if (savedSearchEngine) {
    try {
      currentSearchEngine = JSON.parse(savedSearchEngine);
    } catch (e) {
      console.error('恢复搜索引擎设置失败:', e);
    }
  }
  
  // 主题切换按钮
  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.onclick = () => {
    const cur = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
  };
  
  // 返回顶部按钮
  const backToTopBtn = document.getElementById('back-to-top');
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // 滚动监听
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // 激进的并行加载策略
  const configPromise = loadSiteConfig();
  const linksPromise = loadLinks();
  
  // 立即初始化搜索功能，不等待数据加载
  setupSearch();
  
  // 并行等待所有资源加载完成
  Promise.allSettled([configPromise, linksPromise]).then(results => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`加载失败 [${index}]:`, result.reason);
      }
    });
  });
});

// 设置搜索功能
function setupSearch() {
  const searchInput = domCache.searchInput || 
    (domCache.searchInput = document.getElementById('search-input'));
  const searchButton = domCache.searchButton || 
    (domCache.searchButton = document.getElementById('search-button'));
  const searchResultsCount = domCache.searchResultsCount || 
    (domCache.searchResultsCount = document.getElementById('search-results-count'));
  const searchEngineSelect = domCache.searchEngineSelect || 
    (domCache.searchEngineSelect = document.getElementById('search-engine-select'));
  const searchClear = domCache.searchClear || 
    (domCache.searchClear = document.getElementById('search-clear'));
  
  // 搜索引擎切换
  searchEngineSelect.addEventListener('change', (e) => {
    const selectedOption = e.target.selectedOptions[0];
    currentSearchEngine = {
      name: selectedOption.textContent,
      engine: selectedOption.value,
      url: selectedOption.dataset.url
    };
    
    // 保存搜索引擎设置到localStorage
    localStorage.setItem('searchEngine', JSON.stringify(currentSearchEngine));
    
    // 更新搜索引擎选择器的背景图标
    searchEngineSelect.setAttribute('value', selectedOption.value);
    
    searchInput.focus();
  });
  
  // 立即初始化搜索引擎图标，避免延迟
  const initialOption = searchEngineSelect.selectedOptions[0];
  if (initialOption) {
    searchEngineSelect.setAttribute('value', initialOption.value);
  }
  
  // 恢复保存的搜索引擎选择
  const savedSearchEngine = localStorage.getItem('searchEngine');
  if (savedSearchEngine) {
    try {
      const saved = JSON.parse(savedSearchEngine);
      // 查找并选择保存的搜索引擎
      const savedOption = Array.from(searchEngineSelect.options).find(option => option.value === saved.engine);
      if (savedOption) {
        searchEngineSelect.value = saved.engine;
        searchEngineSelect.setAttribute('value', saved.engine);
        currentSearchEngine = saved;
      }
    } catch (e) {
      console.error('恢复搜索引擎选择失败:', e);
    }
  }
  
  // 搜索按钮点击
  searchButton.addEventListener('click', () => performSearch());
  
  // 回车搜索
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // 清空搜索
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    render(allLinks);
    searchResultsCount.classList.remove('visible');
    searchClear.classList.remove('visible');
  });
  
  // 实时搜索
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const inputValue = searchInput.value;
    
    // 更新清除按钮状态
    if (inputValue.length > 0) {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }
    
    searchTimeout = setTimeout(() => {
      const query = inputValue.trim().toLowerCase();
      
      if (query === '') {
        render(allLinks);
        searchResultsCount.classList.remove('visible');
        return;
      }
      
      const filteredLinks = allLinks.filter(link => {
        return link.title.toLowerCase().includes(query) ||
               link.description.toLowerCase().includes(query) ||
               link.url.toLowerCase().includes(query) ||
               link.category.toLowerCase().includes(query);
      });
      
      render(filteredLinks);
      searchResultsCount.textContent = `找到 ${filteredLinks.length} 个结果`;
      searchResultsCount.classList.add('visible');
    }, 50);
  });
}

// 执行搜索
function performSearch() {
  const searchInput = domCache.searchInput || document.getElementById('search-input');
  const query = searchInput.value.trim();
  
  if (!query) return;
  
  // 检查是否为URL
  if (isValidURL(query)) {
    const url = query.startsWith('http') ? query : 'https://' + query;
    window.open(url, '_blank');
    return;
  }
  
  // 使用搜索引擎搜索
  const searchUrl = currentSearchEngine.url + encodeURIComponent(query);
  window.open(searchUrl, '_blank');
}

// 验证URL
function isValidURL(string) {
  try {
    if (string.startsWith('http://') || string.startsWith('https://')) {
      new URL(string);
      return true;
    }
    
    if (string.includes('.') && !/^\d+$/.test(string)) {
      new URL('https://' + string);
      return true;
    }
    
    return false;
  } catch (_) {
    return false;
  }
}