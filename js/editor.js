/* ======================================================
   XG-Nav 可视化编辑器  —  js/editor.js
   ====================================================== */
(function () {
  'use strict';

  // ==================== 数据模型 ====================
  let groups = []; // [{ name: string, items: [{ name, url, desc, icon }] }]
  let editingItem = null; // { groupIdx, itemIdx } or null (add mode)

  // ==================== Emoji 数据 ====================
  const EMOJI_DATA = {
    '常用': ['⭐','❤️','🔥','✅','🎉','💡','🚀','📌','🔗','💬','📝','🎯','⚡','🌐','🔒','📦','🛠️','📊','🎨','🧭','💰','🎁','📢','🏠','👍','👎','🔍','📚','🗂️','⏰','🔄','💯','🆕','🆓','🔝','📡','🧩','🎬','🎧','💼'],
    '表情': ['😀','😁','😂','🤣','😊','😍','🥰','😎','🤩','🥳','😏','🤔','😴','🙄','😇','🤖','👻','💀','👽','🤡','😤','😭','🥺','😱','🤯','🫡','🫠','🤑','🤗','🫢','😈','💩','🤓','🧐','😵‍💫','🥴','🤒','🤠','😺','🫶'],
    '手势': ['👍','👎','👏','🤝','✌️','🤞','🤟','🤘','👌','🤌','👆','👇','👈','👉','✋','🖐️','🫱','🫲','👋','🫰','💪','🙏','✍️','🤳','💅'],
    '人物': ['👤','👥','👶','👧','👦','🧑','👩','👨','🧓','👴','👵','🧑‍💻','👩‍💻','👨‍💻','🧑‍🎨','🧑‍🔬','🧑‍🏫','🧑‍⚕️','🧑‍🍳','🧑‍🚀','🥷','🦸','🦹','🧙','🧜','🧝','💃','🕺'],
    '动物': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦅','🐳','🐙','🦋','🐝','🐞','🦄','🐍','🐢','🦎','🐠','🐡','🦈','🦭','🦩','🦜','🦆','🕊️','🐊','🐘','🦒','🐏'],
    '植物': ['🌹','🌻','🌷','🌸','💐','🌺','🌼','🍀','🌿','🌱','🪴','🌵','🎋','🎍','🍁','🍂','🍃','🌾','🪻','🪷'],
    '食物': ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝','🍔','🍕','🍣','🍜','🍩','🎂','🍪','☕','🍺','🧃','🥗','🌮','🌯','🍟','🥤','🧋','🍵','🍶','🍰','🧁','🥐','🥨','🥩','🍗','🍝','🍱','🥟','🫕','🧀','🥚','🫖','🍫'],
    '运动': ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥅','⛳','🏊','🏄','🚣','🧗','🚴','🏇','🏋️','🤸','⛷️','🏂','🎿','🛹','🥊','🎳'],
    '交通': ['🚗','🚕','🚌','🚀','✈️','🚂','🚢','🏍️','🚲','🛸','🚁','⛵','🚑','🚒','🚓','🛻','🚜','🛵','🛴','🚠','🚡','🚄','🛩️','🚤','🛥️','⛽'],
    '地点': ['🏠','🏢','🏬','🏫','🏥','🏪','🏭','🏗️','🏰','🏯','🗼','🗽','⛪','🕌','🕍','🛕','🏟️','🎡','🎢','🎠','⛲','🌋','🏔️','🏖️','🏝️','🗻'],
    '物品': ['💻','📱','⌨️','🖥️','🖨️','💾','📀','🎮','🔧','🔨','📐','📏','📎','✂️','🔑','🗄️','📁','📂','🗑️','📮','📷','📹','🎙️','🎚️','🎛️','📺','📻','🔌','💡','🔦','🧲','🧪','🧫','🧬','💊','🩺','🛡️','🔫','🪓','🔭'],
    '符号': ['✨','💫','🌟','⚡','🔔','🎵','🎶','💎','🏆','🎗️','🏷️','❌','⭕','✳️','❇️','🔴','🟢','🔵','🟡','🟣','🟠','⚪','⚫','🟤','▶️','⏸️','⏹️','⏺️','♻️','⚠️','🚫','📵','🔞','❓','❗','‼️','⁉️','💲','©️','®️','™️'],
    '自然': ['☀️','🌙','⭐','🌈','☁️','🌧️','⛈️','❄️','💨','🌊','🔥','💧','🌍','🌎','🌏','☄️','🌑','🌕','🪐','🌌'],
    '旗帜': ['🏁','🚩','🎌','🏴','🏳️','🇨🇳','🇺🇸','🇯🇵','🇬🇧','🇫🇷','🇩🇪','🇰🇷','🇷🇺','🇮🇳','🇧🇷','🇦🇺','🇨🇦','🇮🇹','🇪🇸','🇳🇱','🇸🇪','🇨🇭','🇸🇬','🇹🇼','🇭🇰'],
  };

  // ==================== Cookie 自动保存 ====================
  function saveToCookie() {
    try {
      var yaml = generateYaml(groups);
      localStorage.setItem('xg-nav-editor-draft', yaml);
      localStorage.setItem('xg-nav-editor-draft-time', Date.now().toString());
    } catch (e) { /* ignore */ }
  }

  function loadFromCookie() {
    try {
      var draft = localStorage.getItem('xg-nav-editor-draft');
      if (!draft) return null;
      return draft;
    } catch (e) { return null; }
  }

  function clearDraft() {
    localStorage.removeItem('xg-nav-editor-draft');
    localStorage.removeItem('xg-nav-editor-draft-time');
  }

  // 自动保存（防抖）
  var _saveTimer = null;
  function autoSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function () {
      if (groups.length) saveToCookie();
    }, 500);
  }

  // ==================== 工具函数 ====================
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  function showToast(msg, duration) {
    duration = duration || 2000;
    let t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, duration);
  }

  function normalizeUrl(url) {
    url = (url || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  function getDomain(url) {
    try { return new URL(normalizeUrl(url)).hostname; } catch (e) { return ''; }
  }

  function getOrigin(url) {
    try { return new URL(normalizeUrl(url)).origin; } catch (e) { return ''; }
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ==================== YAML 解析 / 生成 ====================
  function parseYaml(yamlStr) {
    var obj = jsyaml.load(yamlStr);
    if (!obj || typeof obj !== 'object') return [];
    var result = [];
    // v2 format: { "分类名": { "链接名": { url, desc, icon } | "url_string" } }
    Object.keys(obj).forEach(function (cat) {
      var catObj = obj[cat];
      var items = [];
      if (catObj && typeof catObj === 'object' && !Array.isArray(catObj)) {
        Object.keys(catObj).forEach(function (name) {
          var val = catObj[name];
          if (typeof val === 'string') {
            items.push({ name: name, url: val, desc: '', icon: '' });
          } else if (val && typeof val === 'object') {
            items.push({
              name: name,
              url: val.url || '',
              desc: val.desc || val.description || '',
              icon: val.icon || '',
            });
          }
        });
      }
      result.push({ name: cat, items: items });
    });
    return result;
  }

  function generateYaml(groups) {
    var obj = {};
    groups.forEach(function (g) {
      var cat = {};
      g.items.forEach(function (item) {
        var entry = {};
        if (item.url) entry.url = item.url;
        if (item.desc) entry.desc = item.desc;
        if (item.icon) entry.icon = item.icon;
        // 如果只有 url，使用简写
        if (item.url && !item.desc && !item.icon) {
          cat[item.name] = item.url;
        } else {
          cat[item.name] = entry;
        }
      });
      obj[g.name] = cat;
    });
    return jsyaml.dump(obj, { lineWidth: -1, quotingType: "'", forceQuotes: false, noRefs: true });
  }

  // ==================== 图标预览 ====================
  function renderIconPreview(iconStr) {
    iconStr = (iconStr || '').trim();
    if (!iconStr) return '<span class="icon-preview-label">无图标（将自动获取 Favicon）</span>';
    if (iconStr.startsWith('emoji:')) {
      var emoji = iconStr.slice(6);
      return '<span class="emoji-preview">' + escapeHtml(emoji) + '</span><span class="icon-preview-label">Emoji: ' + escapeHtml(emoji) + '</span>';
    }
    if (/^https?:\/\//i.test(iconStr)) {
      return '<img src="' + escapeHtml(iconStr) + '" onerror="this.style.display=\'none\'" alt="icon"><span class="icon-preview-label">' + escapeHtml(iconStr) + '</span>';
    }
    // 本地图标名或其他
    return '<span class="icon-preview-label">本地图标: ' + escapeHtml(iconStr) + '</span>';
  }

  function renderSmallIcon(iconStr, url) {
    iconStr = (iconStr || '').trim();
    if (iconStr.startsWith('emoji:')) {
      var emoji = iconStr.slice(6);
      return '<span class="nav-icon-preview" style="display:flex;align-items:center;justify-content:center;font-size:14px;background:none">' + escapeHtml(emoji) + '</span>';
    }
    var src = '';
    if (/^https?:\/\//i.test(iconStr)) {
      src = iconStr;
    } else if (iconStr) {
      // 本地图标 - 尝试常见扩展
      if (/\.\w+$/.test(iconStr)) {
        src = 'ico/' + iconStr;
      } else {
        src = 'ico/' + iconStr + '.png';
      }
    } else {
      // 默认 favicon（国内可用服务）
      var domain = getDomain(url);
      if (domain) src = 'https://favicon.yandex.net/favicon/' + domain;
    }
    if (src) {
      return '<img class="nav-icon-preview" src="' + escapeHtml(src) + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><rect width=%2216%22 height=%2216%22 rx=%222%22 fill=%22%23ddd%22/></svg>\'" alt="">';
    }
    return '<span class="nav-icon-preview"></span>';
  }

  // ==================== 渲染编辑器 ====================
  function renderGroups() {
    var container = $('#groups-container');
    if (!groups.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<div class="icon">📋</div>' +
        '<p>还没有导航数据，点击下方按钮添加分组，或导入已有的 YAML</p>' +
        '</div>';
      return;
    }

    var html = '';
    groups.forEach(function (g, gi) {
      html += '<div class="group-card" data-group="' + gi + '">';
      html += '<div class="group-header">';
      html += '<span class="group-drag-handle" title="拖拽排序分组">⠿</span>';
      html += '<input class="group-name-input" value="' + escapeHtml(g.name) + '" data-group="' + gi + '" placeholder="分组名称">';
      html += '<div class="group-actions">';
      html += '<button class="btn btn-sm btn-danger" onclick="EditorApp.deleteGroup(' + gi + ')" title="删除分组">✕</button>';
      html += '</div></div>';

      html += '<div class="nav-grid" data-group="' + gi + '">';
      g.items.forEach(function (item, ii) {
        html += '<div class="nav-card" data-item="' + ii + '">';
        html += '<div class="nav-card-header">';
        html += '<span class="nav-drag-handle" title="拖拽排序">⠿</span>';
        html += renderSmallIcon(item.icon, item.url);
        html += '<span class="nav-name">' + escapeHtml(item.name) + '</span>';
        html += '</div>';
        html += '<div class="nav-card-sub nav-card-desc">' + escapeHtml(item.desc || '') + '</div>';
        html += '<div class="nav-card-sub nav-card-url">' + escapeHtml(item.url || '') + '</div>';
        html += '<div class="nav-actions">';
        html += '<button class="btn btn-sm" onclick="EditorApp.editItem(' + gi + ',' + ii + ')">✏️</button>';
        html += '<button class="btn btn-sm btn-danger" onclick="EditorApp.deleteItem(' + gi + ',' + ii + ')">✕</button>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '<button class="add-nav-btn" onclick="EditorApp.addItem(' + gi + ')">＋ 添加导航</button>';
      html += '</div>';
    });

    container.innerHTML = html;

    // 绑定分组名称修改
    $$('.group-name-input', container).forEach(function (input) {
      input.addEventListener('change', function () {
        var gi = parseInt(this.dataset.group);
        groups[gi].name = this.value.trim() || '未命名分组';
        autoSave();
      });
    });

    initSortable();
    applyCardDisplayMode();
  }

  // ==================== SortableJS 初始化 ====================
  var sortableInstances = [];

  function initSortable() {
    // 销毁旧实例
    sortableInstances.forEach(function (s) { s.destroy(); });
    sortableInstances = [];

    var container = $('#groups-container');

    // 分组级排序
    sortableInstances.push(
      new Sortable(container, {
        animation: 180,
        handle: '.group-drag-handle',
        draggable: '.group-card',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function (evt) {
          var item = groups.splice(evt.oldIndex, 1)[0];
          groups.splice(evt.newIndex, 0, item);
          renderGroups();
          autoSave();
        },
      })
    );

    // 导航项级排序（跨分组）
    $$('.nav-grid', container).forEach(function (list) {
      sortableInstances.push(
        new Sortable(list, {
          group: 'nav-items',
          animation: 150,
          handle: '.nav-drag-handle',
          draggable: '.nav-card',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          onEnd: function (evt) {
            var fromGi = parseInt(evt.from.dataset.group);
            var toGi = parseInt(evt.to.dataset.group);
            var item = groups[fromGi].items.splice(evt.oldIndex, 1)[0];
            groups[toGi].items.splice(evt.newIndex, 0, item);
            renderGroups();
            autoSave();
          },
        })
      );
    });
  }

  // ==================== 分组操作 ====================
  function addGroup() {
    groups.push({ name: '新分组', items: [] });
    renderGroups();
    autoSave();
    // 聚焦新分组名称输入框
    var inputs = $$('.group-name-input');
    var last = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
  }

  function deleteGroup(gi) {
    var g = groups[gi];
    if (!confirm('确定删除分组「' + g.name + '」及其所有导航？')) return;
    groups.splice(gi, 1);
    renderGroups();
    autoSave();
    showToast('已删除分组');
  }

  // ==================== 导航项操作 ====================
  function addItem(gi) {
    editingItem = { groupIdx: gi, itemIdx: -1 };
    openItemModal({ name: '', url: '', desc: '', icon: '' }, '添加导航');
  }

  function editItem(gi, ii) {
    editingItem = { groupIdx: gi, itemIdx: ii };
    var item = groups[gi].items[ii];
    openItemModal(Object.assign({}, item), '编辑导航');
  }

  function deleteItem(gi, ii) {
    var item = groups[gi].items[ii];
    if (!confirm('确定删除「' + item.name + '」？')) return;
    groups[gi].items.splice(ii, 1);
    renderGroups();
    autoSave();
    showToast('已删除');
  }

  // ==================== 导航编辑模态框 ====================
  function openItemModal(item, title) {
    var modal = $('#item-modal');
    $('#item-modal-title').textContent = title;
    $('#item-url').value = item.url;
    $('#item-name').value = item.name;
    $('#item-desc').value = item.desc;

    // 图标模式
    var icon = item.icon || '';
    var isEmoji = icon.startsWith('emoji:');
    setIconMode(isEmoji ? 'emoji' : 'url');

    if (isEmoji) {
      $('#item-icon-url').value = '';
      currentEmoji = icon.slice(6);
    } else {
      $('#item-icon-url').value = icon;
      currentEmoji = '';
    }
    // 同步 emoji 输入框
    if ($('#emoji-input')) $('#emoji-input').value = currentEmoji;

    updateIconPreview();
    // 清空 favicon 候选
    $('#favicon-candidates').innerHTML = '';

    modal.classList.add('active');
    if (!item.url) {
      $('#item-url').focus();
    }
  }

  function closeItemModal() {
    abortFetch();
    $('#item-modal').classList.remove('active');
    editingItem = null;
  }

  function saveItem() {
    var name = $('#item-name').value.trim();
    var url = $('#item-url').value.trim();
    if (!name) { showToast('请输入名称'); $('#item-name').focus(); return; }
    if (!url) { showToast('请输入网址'); $('#item-url').focus(); return; }
    // 自动补全协议
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;

    var iconMode = $('.icon-mode-tab.active').dataset.mode;
    var icon = '';
    if (iconMode === 'emoji' && currentEmoji) {
      icon = 'emoji:' + currentEmoji;
    } else if (iconMode === 'url') {
      icon = $('#item-icon-url').value.trim();
    }

    var itemData = { name: name, url: url, desc: $('#item-desc').value.trim(), icon: icon };

    if (editingItem.itemIdx === -1) {
      groups[editingItem.groupIdx].items.push(itemData);
    } else {
      groups[editingItem.groupIdx].items[editingItem.itemIdx] = itemData;
    }

    closeItemModal();
    renderGroups();
    autoSave();
    showToast('已保存');
  }

  // ==================== 图标模式切换 ====================
  var currentEmoji = '';

  function setIconMode(mode) {
    $$('.icon-mode-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    if (mode === 'url') {
      $('.icon-url-section').classList.add('active');
      $('.icon-emoji-section').classList.remove('active');
    } else {
      $('.icon-url-section').classList.remove('active');
      $('.icon-emoji-section').classList.add('active');
    }
    updateIconPreview();
  }

  function updateIconPreview() {
    var mode = $('.icon-mode-tab.active').dataset.mode;
    var iconStr = '';
    if (mode === 'emoji' && currentEmoji) {
      iconStr = 'emoji:' + currentEmoji;
    } else if (mode === 'url') {
      iconStr = $('#item-icon-url').value.trim();
    }
    $('#icon-preview').innerHTML = renderIconPreview(iconStr);
  }

  // ==================== Emoji 选择器 ====================
  function renderEmojiPicker() {
    var grid = $('#emoji-grid');
    var html = '';
    Object.keys(EMOJI_DATA).forEach(function (cat) {
      html += '<div class="emoji-category-label">' + escapeHtml(cat) + '</div>';
      EMOJI_DATA[cat].forEach(function (em) {
        html += '<button type="button" class="emoji-item" data-emoji="' + escapeHtml(em) + '">' + em + '</button>';
      });
    });
    grid.innerHTML = html;

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.emoji-item');
      if (!btn) return;
      currentEmoji = btn.dataset.emoji;
      $$('.emoji-item', grid).forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      if ($('#emoji-input')) $('#emoji-input').value = currentEmoji;
      updateIconPreview();
    });
  }

  function filterEmoji(keyword) {
    keyword = keyword.toLowerCase().trim();
    $$('.emoji-item', $('#emoji-grid')).forEach(function (btn) {
      btn.style.display = (!keyword || btn.dataset.emoji.includes(keyword)) ? '' : 'none';
    });
  }

  // ==================== 获取网站信息 ====================

  // HTML 实体解码
  function decodeHtmlEntities(str) {
    var ta = document.createElement('textarea');
    ta.innerHTML = str;
    return ta.value;
  }

  function parseSeoFromHtml(html) {
    // 辅助：提取 meta content（逐个解析 meta 标签，分别处理双引号/单引号避免截断）
    function getMetaContent(nameOrProp, attrType) {
      attrType = attrType || 'name';
      var metaTags = html.match(/<meta\s[^>]*>/gi) || [];
      for (var i = 0; i < metaTags.length; i++) {
        var tag = metaTags[i];
        // 检查是否包含目标属性（name="description" / property="og:title" 等）
        var attrRe = new RegExp(attrType + '\\s*=\\s*["\']' + nameOrProp + '["\']', 'i');
        if (!attrRe.test(tag)) continue;
        // 提取 content 值（分别匹配双引号和单引号）
        var cm = tag.match(/content\s*=\s*"([^"]*)"/i)
              || tag.match(/content\s*=\s*'([^']*)'/i);
        if (cm && cm[1]) return decodeHtmlEntities(cm[1].trim());
      }
      return '';
    }

    // 提取 title
    if (!$('#item-name').value.trim()) {
      var titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        var raw = decodeHtmlEntities(titleMatch[1].trim());
        // 中文站点常用 _ - | — – : / 做分隔，取第一段
        var cleanTitle = raw.split(/\s*[-|–—_｜:：\/]\s*/)[0].trim();
        $('#item-name').value = cleanTitle || raw;
      }
    }

    // 提取 description
    if (!$('#item-desc').value.trim()) {
      var desc = getMetaContent('description', 'name')
        || getMetaContent('og:description', 'property')
        || getMetaContent('twitter:description', 'name')
        || getMetaContent('twitter:description', 'property');
      if (desc) $('#item-desc').value = desc;
    }

    // 如果仍无 title，尝试 og:title / twitter:title / og:site_name
    if (!$('#item-name').value.trim()) {
      var ogTitle = getMetaContent('og:title', 'property')
        || getMetaContent('twitter:title', 'name')
        || getMetaContent('twitter:title', 'property')
        || getMetaContent('og:site_name', 'property');
      if (ogTitle) {
        var clean = ogTitle.split(/\s*[-|–—_｜:：\/]\s*/)[0].trim();
        $('#item-name').value = clean || ogTitle;
      }
    }
  }

  // ==================== 获取信息（支持超时 + 取消） ====================
  var _fetchAbortController = null;

  function abortFetch() {
    if (_fetchAbortController) {
      _fetchAbortController.abort();
      _fetchAbortController = null;
    }
    var btn = $('#fetch-info-btn');
    if (btn) {
      btn.classList.remove('loading');
      btn.textContent = '获取信息';
    }
  }

  function tryFetchWithProxies(proxies, index, url, signal, callback) {
    if (signal.aborted) { callback(null); return; }
    if (index >= proxies.length) { callback(null); return; }
    var proxy = proxies[index];
    var fetchUrl = proxy.buildUrl(url);
    fetch(fetchUrl, { signal: signal })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return proxy.parse(r);
      })
      .then(function (html) {
        if (signal.aborted) { callback(null); return; }
        if (html && html.length > 100) callback(html);
        else tryFetchWithProxies(proxies, index + 1, url, signal, callback);
      })
      .catch(function () {
        if (signal.aborted) { callback(null); return; }
        tryFetchWithProxies(proxies, index + 1, url, signal, callback);
      });
  }

  function fetchSiteInfo() {
    var rawUrl = $('#item-url').value.trim();
    if (!rawUrl) { showToast('请先输入网址'); return; }
    if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'http://' + rawUrl;

    // 取消上一个请求
    abortFetch();

    var controller = new AbortController();
    _fetchAbortController = controller;

    // 总超时 20 秒
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 20000);

    var btn = $('#fetch-info-btn');
    btn.classList.add('loading');
    btn.textContent = '获取中…';

    var domain = getDomain(rawUrl);
    var origin = getOrigin(rawUrl);
    showFaviconCandidates(domain, origin);

    var proxies = [
      // 优先级 1: allorigins（国内部分可用）
      {
        buildUrl: function (u) { return 'https://api.allorigins.win/get?url=' + encodeURIComponent(u); },
        parse: function (r) { return r.json().then(function (d) { return d && d.contents; }); }
      },
      // 优先级 2: corsproxy
      {
        buildUrl: function (u) { return 'https://corsproxy.io/?' + encodeURIComponent(u); },
        parse: function (r) { return r.text(); }
      }
    ];

    tryFetchWithProxies(proxies, 0, rawUrl, controller.signal, function (html) {
      clearTimeout(timeoutId);
      _fetchAbortController = null;
      if (controller.signal.aborted) {
        btn.classList.remove('loading');
        btn.textContent = '获取信息';
        return;
      }
      if (html) {
        parseSeoFromHtml(html);
        showToast('已获取网站信息');
      } else {
        showToast('获取失败，请手动填写');
      }
      btn.classList.remove('loading');
      btn.textContent = '获取信息';
    });
  }

  function showFaviconCandidates(domain, origin) {
    var candidates = [];

    // 国内可用的 Favicon API 服务（优先）
    if (domain) {
      candidates.push({ label: 'Yandex Favicon', url: 'https://favicon.yandex.net/favicon/' + domain });
      candidates.push({ label: 'iowen API', url: 'https://api.iowen.cn/favicon/' + domain + '.png' });
      candidates.push({ label: 'Google Favicon', url: 'https://www.google.com/s2/favicons?sz=64&domain=' + domain });
    }

    if (origin) {
      candidates.push({ label: 'favicon.ico', url: origin + '/favicon.ico' });
      candidates.push({ label: 'favicon.png', url: origin + '/favicon.png' });
      candidates.push({ label: 'favicon.svg', url: origin + '/favicon.svg' });
      candidates.push({ label: 'apple-touch-icon', url: origin + '/apple-touch-icon.png' });
      candidates.push({ label: 'logo.png', url: origin + '/logo.png' });
      candidates.push({ label: 'logo.svg', url: origin + '/logo.svg' });
      // WordPress
      candidates.push({ label: 'wp-icon', url: origin + '/wp-content/uploads/favicon.ico' });
      candidates.push({ label: 'wp-site-icon', url: origin + '/wp-content/uploads/site-icon.png' });
      // 常见其他路径
      candidates.push({ label: 'icon-192', url: origin + '/icon-192x192.png' });
      candidates.push({ label: 'icons/favicon', url: origin + '/icons/favicon.ico' });
      candidates.push({ label: 'img/favicon', url: origin + '/img/favicon.ico' });
      candidates.push({ label: 'images/favicon', url: origin + '/images/favicon.ico' });
    }

    var container = $('#favicon-candidates');
    if (!candidates.length) { container.innerHTML = ''; return; }

    var html = '<div class="form-label" style="margin-top:0.5rem">Favicon 候选（点击选用）</div>';
    candidates.forEach(function (c) {
      html += '<div class="favicon-candidate" data-url="' + escapeHtml(c.url) + '" style="display:none">';
      html += '<img src="' + escapeHtml(c.url) + '" alt="">';
      html += '<span>' + escapeHtml(c.label) + '</span>';
      html += '</div>';
    });
    container.innerHTML = html;

    // 图片加载成功则显示，失败则隐藏
    $$('.favicon-candidate img', container).forEach(function (img) {
      img.addEventListener('load', function () {
        this.parentElement.style.display = '';
      });
      img.addEventListener('error', function () {
        this.parentElement.style.display = 'none';
      });
    });
    // Yandex Favicon 默认显示（国内可用）
    var firstCandidate = $('.favicon-candidate', container);
    if (firstCandidate && domain) firstCandidate.style.display = '';

    $$('.favicon-candidate', container).forEach(function (el) {
      el.addEventListener('click', function () {
        var iconUrl = this.dataset.url;
        setIconMode('url');
        $('#item-icon-url').value = iconUrl;
        $$('.favicon-candidate', container).forEach(function (c) { c.classList.remove('selected'); });
        this.classList.add('selected');
        updateIconPreview();
      });
    });
  }

  // ==================== YAML 导入 ====================
  function openImportModal() {
    $('#yaml-textarea').value = '';
    $('#import-modal').classList.add('active');
    $('#yaml-textarea').focus();
  }

  function closeImportModal() {
    $('#import-modal').classList.remove('active');
  }

  // ==================== TXT 解析 ====================
  function parseTxt(txtStr) {
    var lines = txtStr.trim().split('\n').filter(function (l) { return l.trim() && !l.startsWith('#'); });
    var groupMap = {};
    var order = [];
    lines.forEach(function (line) {
      var parts = line.split(',');
      if (parts.length >= 3) {
        var name = parts[0].trim();
        var desc = parts[1].trim();
        var url = parts[2].trim();
        var cat = parts[3] ? parts[3].trim() : '未分类';
        if (!groupMap[cat]) { groupMap[cat] = []; order.push(cat); }
        groupMap[cat].push({ name: name, url: url, desc: desc, icon: '' });
      }
    });
    return order.map(function (cat) { return { name: cat, items: groupMap[cat] }; });
  }

  function doImport() {
    var content = $('#yaml-textarea').value.trim();
    if (!content) { showToast('请粘贴配置内容'); return; }
    if (groups.length && !confirm('导入将覆盖当前编辑器中的所有数据，是否继续？')) return;
    var parsed = [];
    try {
      // 先尝试 YAML 解析
      parsed = parseYaml(content);
    } catch (e) {
      parsed = [];
    }
    // 如果 YAML 无结果，尝试 TXT 格式
    if (!parsed.length) {
      parsed = parseTxt(content);
    }
    if (!parsed.length) { showToast('未解析到有效数据'); return; }
    groups = parsed;
    renderGroups();
    autoSave();
    closeImportModal();
    showToast('导入成功，共 ' + groups.length + ' 个分组');
  }

  // ==================== YAML 导出 ====================
  function openExportModal() {
    if (!groups.length) { showToast('暂无数据可导出'); return; }
    var yaml = generateYaml(groups);
    $('#export-textarea').value = yaml;
    $('#export-modal').classList.add('active');
  }

  function closeExportModal() {
    $('#export-modal').classList.remove('active');
  }

  function copyYaml() {
    var yaml = groups.length ? generateYaml(groups) : '';
    if (!yaml) { showToast('暂无数据'); return; }
    navigator.clipboard.writeText(yaml).then(function () {
      showToast('已复制到剪贴板');
    }).catch(function () {
      // 降级：选中 textarea
      var ta = $('#export-textarea');
      if (ta && ta.value) { ta.select(); document.execCommand('copy'); showToast('已复制'); }
      else showToast('复制失败');
    });
  }

  function downloadYaml() {
    var yaml = groups.length ? generateYaml(groups) : '';
    if (!yaml) { showToast('暂无数据'); return; }
    var blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'links.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast('已下载 links.yaml');
  }

  // ==================== 主题切换 ====================
  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function toggleTheme() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  }

  // ==================== 加载本地数据 ====================
  function loadLocalData() {
    // 优先从 cookie/localStorage 恢复草稿
    var draft = loadFromCookie();
    if (draft) {
      try {
        var draftParsed = parseYaml(draft);
        if (draftParsed.length) {
          groups = draftParsed;
          renderGroups();
          var draftTime = localStorage.getItem('xg-nav-editor-draft-time');
          var timeStr = draftTime ? new Date(parseInt(draftTime)).toLocaleString() : '';
          showToast('已恢复上次编辑草稿' + (timeStr ? '（' + timeStr + '）' : ''), 3000);
          return;
        }
      } catch (e) { /* ignore */ }
    }

    // 无草稿，加载 links.yaml
    fetch('data/links.yaml')
      .then(function (r) {
        if (!r.ok) throw new Error('no yaml');
        return r.text();
      })
      .then(function (yamlStr) {
        var parsed = parseYaml(yamlStr);
        if (parsed.length) {
          groups = parsed;
          renderGroups();
          showToast('已加载 links.yaml，共 ' + groups.length + ' 个分组');
        } else {
          throw new Error('empty yaml');
        }
      })
      .catch(function () {
        fetch('data/links.txt')
          .then(function (r) {
            if (!r.ok) throw new Error('no txt');
            return r.text();
          })
          .then(function (txtStr) {
            var parsed = parseTxt(txtStr);
            if (parsed.length) {
              groups = parsed;
              renderGroups();
              showToast('已加载 links.txt，共 ' + groups.length + ' 个分组');
            }
          })
          .catch(function () {
            // 无数据文件，保持空状态
          });
      });
  }

  // ==================== 获取默认配置 ====================
  function fetchDefaultYaml() {
    fetch('data/links.yaml')
      .then(function (r) {
        if (!r.ok) throw new Error('无法读取');
        return r.text();
      })
      .then(function (yamlStr) {
        if (!yamlStr.trim()) { showToast('默认配置为空'); return; }
        $('#yaml-textarea').value = yamlStr;
        showToast('已加载默认配置');
      })
      .catch(function () {
        showToast('无法读取默认配置文件');
      });
  }

  // ==================== 卡片显示模式切换（描述/网址） ====================
  var _showUrl = false;

  function applyCardDisplayMode() {
    var descEls = $$('.nav-card-sub.nav-card-desc');
    var urlEls = $$('.nav-card-sub.nav-card-url');
    descEls.forEach(function (el) { el.style.display = _showUrl ? 'none' : ''; });
    urlEls.forEach(function (el) { el.style.display = _showUrl ? '' : 'none'; });
  }

  // ==================== 初始化 ====================
  function init() {
    initTheme();
    renderEmojiPicker();
    renderGroups();
    loadLocalData();

    // 主题切换
    $('#theme-toggle').addEventListener('click', toggleTheme);

    // 添加分组
    $('#add-group-btn').addEventListener('click', addGroup);

    // 描述/网址切换
    var toggleGroup = $('#toggle-desc-url');
    if (toggleGroup) {
      $$('.toggle-btn', toggleGroup).forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('.toggle-btn', toggleGroup).forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
          _showUrl = this.dataset.mode === 'url';
          applyCardDisplayMode();
        });
      });
    }

    // 工具栏按钮
    $('#btn-import').addEventListener('click', openImportModal);
    $('#btn-export').addEventListener('click', openExportModal);


    // 导入模态框
    $$('.import-close-btn').forEach(function (btn) {
      btn.addEventListener('click', closeImportModal);
    });
    $('#import-confirm').addEventListener('click', doImport);

    // 获取默认配置按钮
    $('#btn-fetch-default').addEventListener('click', function () {
      var textarea = $('#yaml-textarea');
      if (textarea.value.trim()) {
        if (!confirm('当前文本框已有内容，加载默认配置将覆盖，是否继续？')) return;
      }
      fetchDefaultYaml();
    });

    // 导出模态框
    $('#export-close').addEventListener('click', closeExportModal);
    $('#export-fullscreen').addEventListener('click', function () {
      var modal = $('#export-modal').querySelector('.modal');
      modal.classList.toggle('fullscreen');
    });
    $('#export-copy').addEventListener('click', copyYaml);
    $('#export-download').addEventListener('click', downloadYaml);

    // 导航编辑模态框
    $('#item-modal-close').addEventListener('click', closeItemModal);
    $('#item-cancel').addEventListener('click', closeItemModal);
    $('#item-save').addEventListener('click', saveItem);
    $('#fetch-info-btn').addEventListener('click', fetchSiteInfo);

    // 图标模式切换
    $$('.icon-mode-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setIconMode(this.dataset.mode);
      });
    });

    // 图标 URL 输入实时预览
    $('#item-icon-url').addEventListener('input', updateIconPreview);

    // Emoji 搜索
    $('#emoji-search').addEventListener('input', function () {
      filterEmoji(this.value);
    });

    // Emoji 手动输入
    if ($('#emoji-input')) {
      $('#emoji-input').addEventListener('input', function () {
        currentEmoji = this.value;
        updateIconPreview();
      });
    }

    // ESC 关闭模态框
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('#item-modal').classList.contains('active')) closeItemModal();
        else if ($('#import-modal').classList.contains('active')) closeImportModal();
        else if ($('#export-modal').classList.contains('active')) closeExportModal();
      }
    });

    // 点击遮罩关闭模态框（区分拖拽选文字和真正的点击）
    var _overlayMouseDownTarget = null;
    $$('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('mousedown', function (e) {
        _overlayMouseDownTarget = e.target;
      });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay && _overlayMouseDownTarget === overlay) {
          overlay.classList.remove('active');
          editingItem = null;
        }
        _overlayMouseDownTarget = null;
      });
    });
  }

  // 公开 API
  window.EditorApp = {
    deleteGroup: deleteGroup,
    addItem: addItem,
    editItem: editItem,
    deleteItem: deleteItem,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
