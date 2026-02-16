# XG-Nav 导航站

一个简洁、纯HTML静态的个人导航站，支持深浅色切换和多搜索引擎。

## 功能特性

- 🎨 简约现代风格
- 🌓 深浅色主题切换
- 🔍 多搜索引擎支持
- 📱 响应式设计，适配移动端
- ⚡ 纯静态页面，极速加载
- 📂 分类管理，支持自定义分组
- 🐳 Docker 容器化部署
- 🔧 灵活配置，支持环境变量和配置文件
- 🏷️ 动态标题，根据配置自动更新页面标题
- 🔍 搜索功能，快速查找导航链接
- ⚡ 性能优化，图标懒加载和缓存机制
- 🎯 SEO友好，支持自定义meta信息

## Docker容器部署

### 方式一：使用 docker-compose（推荐）

创建 `docker-compose.yml` 文件：

```yaml
services:
  xg-nav:
    image: ghcr.io/verkyer/nav:latest
    container_name: xg-nav
    ports:
      - "26180:80"  # 可自定义端口
    environment:
      # - SITE_TITLE=网站标题
      # - SITE_DESCRIPTION=网站描述
      # - COPYRIGHT=版权信息，支持HTML（留个项目地址呗~）
      - CARD_CONTENT=0  # 0=显示描述信息，1=显示链接URL
      # - SHOW_FAVICON=1  # 1=显示favicon图标，0=不显示
      # - DEFAULT_ENGINE=bing  # 默认搜索引擎
    restart: unless-stopped
    volumes:
      - ./data:/usr/share/nginx/html/data
      - ./ico:/usr/share/nginx/html/ico  # 自定义图标目录（本地名/文件）
```

### 方式二：直接使用 Docker 命令

```bash
docker run -d \
  --name xg-nav \
  -p 26180:80 \
  -v $(pwd)/data:/usr/share/nginx/html/data \
  --restart unless-stopped \
  ghcr.io/verkyer/nav:latest
```
`$(pwd)/data` 替换为实际路径

如需自定义网站信息，可添加环境变量：
```bash
docker run -d \
  --name xg-nav \
  -p 26180:80 \
  -e SITE_TITLE="网站标题" \
  -e SITE_DESCRIPTION="网站描述" \
  -e COPYRIGHT="版权信息，支持HTML" \
  -e CARD_CONTENT=0 \ # 0=显示描述信息，1=显示链接URL
  -e SHOW_FAVICON=1 \ # 1=显示favicon图标，0=不显示
  -e DEFAULT_ENGINE=bing \ # 设置默认搜索引擎
  -v $(pwd)/data:/usr/share/nginx/html/data \
  --restart unless-stopped \
  verky/xg-nav:latest
```

## HTML 部署

下载整项目放到网站运行目录，确保`index.html`在根目录下！

### 修改信息

编辑根目录下的 `config.json` 文件：

- `SITE_TITLE`:"网站标题"
- `SITE_DESCRIPTION`:"网站描述"
- `COPYRIGHT`:"版权信息，支持HTML"
- `CARD_CONTENT`: 0 （0=显示描述信息，1=显示链接URL）
- `SHOW_FAVICON`: 1 （1=显示favicon图标，0=不显示）

**配置优先级**：环境变量 > config.json > 内置默认值

## 链接管理

本项目支持 **YAML** (推荐) 和 **TXT** 两种配置格式。数据文件位于 `data/` 目录下。

### 1. YAML 格式（推荐）

编辑 `data/links.yaml`，结构清晰，支持更多特性（如自定义图标）：

```yaml
博客:
  小鸽志:
    url: https://www.xiaoge.org
    desc: 个人技术博客分享
  DockerApps:
    url: https://dockerapps.com
    desc: Docker应用程序集合
    icon: emoji:🐳

购物:
  淘宝:
    url: https://www.taobao.com
    desc: 中国最大购物平台
  京东:
    url: jd.com
    # icon 留空 → 使用默认 favicon
```

- **特性**：
  - 链接值为字符串表示仅 URL；对象可写 `url/desc/icon`
  - 不写 `icon` → 使用 favicon 自动抓取
  - URL 不含协议 → 自动补 `http://`

### 2. TXT 格式（简单）

编辑 `data/links.txt`，适合快速添加，格式为 CSV：`标题,描述,URL,分类`。

```txt
小鸽志,个人技术博客分享,https://www.xiaoge.org,博客
DockerApps,Docker应用程序集合,https://dockerapps.com,博客
淘宝,中国最大购物平台,https://www.taobao.com,购物
```

- **注意**：
  - 使用英文逗号 `,` 分隔
  - 如果缺失分类，默认为"未分类"
  - **Docker环境**：启动时会自动将 `.txt` 转换为 `.yaml` 以提升性能。
  - **纯静态环境**：如果加载 `.yaml` 失败，前端会自动尝试加载 `.txt`。

**兼容迁移**：若存在旧版 `links.txt`，容器首次启动会自动转换为上述结构。

## 搜索与图标

导航站内置搜索支持通过配置选择搜索引擎：
- 搜索引擎在 `config.json` 中配置：
  - `SEARCH_ENGINES`: `{ name, engine, url }[]`
  - `DEFAULT_ENGINE`: 默认引擎，如 `"bing"`
- 页面下拉由配置动态生成，仍支持本地记忆上次选择
- 搜索特性：
  - 🔍 实时搜索：输入关键词即时显示匹配结果
  - 🎯 多字段匹配：支持按网站名称、描述、分类搜索
  - ⚡ 快速响应：优化的搜索算法，毫秒级响应
  - 🔄 智能过滤：自动过滤空白和特殊字符

**icon 写法与目录**：
- 本地名：`icon: github`（在 `ico/` 中按顺序尝试 `png→svg→ico→jpg`）
- 本地文件：`icon: github.svg/png/jpg/ico`（精确匹配）
- 远程：`icon: https://...` 或 `icon: domain/path.svg`（无协议→`http://`）
- emoji：`icon: 🧭` 或 `icon: emoji:🧭`
- 不写 `icon`：默认使用网站 favicon（Yandex 服务）

目录约定：
- `ico/` 用于用户自定义图标（链接卡片使用）。
- 内置搜索引擎图标已迁移到 `assets/search/`，页面选择器自动使用，无需用户维护。

## 主题切换

支持深浅色主题无缝切换：
- 🌞 浅色主题：简洁明亮的白色主题
- 🌙 深色主题：护眼的深色主题
- 💾 记忆功能：自动保存用户的主题偏好
- 🎨 平滑过渡：主题切换带有流畅的动画效果

## 性能优化

- ⚡ **图标懒加载**：只加载可见区域的图标，提升页面加载速度
- 🗄️ **缓存机制**：智能缓存配置和链接数据
- 📱 **响应式设计**：完美适配各种设备尺寸
- 🔧 **代码优化**：精简的代码结构，最小化资源占用

## 访问地址

部署完成后，访问 `http://localhost:26180` 即可使用导航站。

## 更新日志

### v1.1.0 (2025.12.07)
- 调整目录结构：内置搜索引擎图标迁移至 `assets/search/`，`ico/` 作为用户自定义图标目录
- 修复图标解析：支持 `icon: url:...` 前缀，兼容省略协议自动补全
- 优化 YAML：添加简洁注释与示例，修复缩进错误导致的加载失败
- 更新样式与资源：CSS 引用路径改为新目录并提升版本号
- 完善容器配置：`docker-compose.yml` 新增 `DEFAULT_ENGINE` 环境变量示例、挂载 `ico/` 目录
- 完善文档：README 同步目录约定、图标写法与 YAML v2 示例

### v1.0.5 (2025.09.13)
- 🐛 修复Docker部署中SHOW_FAVICON环境变量无法生效的问题

### v1.0.4 (2025.08.21)
- ✨ 新增Favicon可选显示功能，支持通过配置控制图标显示或隐藏
- 🎯 优化布局对齐，隐藏图标时标题与描述文本完美对齐

### v1.0.3 (2025.08.17)
- 🔄 更换为Yandex Favicon服务，提升国内访问稳定性

### v1.0.2 (2025.08.16)
- 🐛 修复了点击导航卡片同时打开2个链接的问题
- ✨ 优化了点击事件处理机制，不再请求弹出窗口权限

### v1.0.1 (2025.08.16)
- 🎯 新增动态favicon图标功能，自动获取并显示网站图标
- ⚡ 优化图标加载机制，预分配空间防止页面布局抖动
- 🔧 完善图标加载失败时的降级处理

### v1.0.0 (2025.08.06)
- 🎉 项目初始发布
- 🎨 实现简约现代的UI设计
- 🌓 支持深浅色主题切换
- 📂 实现分类管理功能
- 🐳 提供Docker容器化部署方案
- ✨ 新增搜索功能，支持实时搜索导航链接
- 🎯 优化主题切换机制，提升用户体验
- ⚡ 实现图标懒加载，显著提升页面加载性能
- 🔧 优化代码结构，提高可维护性
- 🏷️ 新增动态标题功能，根据配置自动更新
- 🐛 修复若干已知问题，提升稳定性
