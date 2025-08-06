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
    restart: unless-stopped
    volumes:
      - ./data:/usr/share/nginx/html/data
```

### 方式二：直接使用 Docker 命令

```bash
docker run -d \
  --name xg-nav \
  -p 26180:80 \
  -v ./data:/usr/share/nginx/html/data \
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
  -v $(pwd)/data:/usr/share/nginx/html/data \
  --restart unless-stopped \
  ghcr.io/verkyer/nav:latest
```

## HTML 部署

下载整项目放到网站运行目录，确保`index.html`在根目录下！

### 修改信息

编辑根目录下的 `config.json` 文件：

- `SITE_TITLE`:"网站标题"
- `SITE_DESCRIPTION`:"网站描述"
- `COPYRIGHT`:"版权信息，支持HTML"
- `CARD_CONTENT`: 0 （0=显示描述信息，1=显示链接URL）

**配置优先级**：环境变量 > config.json > 内置默认值

## 链接管理

编辑 `data/links.txt` 文件来管理导航链接，每行一个链接，格式为：

```
网站名称,描述,URL,分类
```

**示例**：
```
小鸽志,个人技术博客分享,https://www.xiaoge.org,博客
淘宝,中国最大购物平台,https://www.taobao.com,购物
GitHub,全球最大代码托管平台,https://github.com,开发工具
```

**分类说明**：
- 支持中文分类名称
- 相同分类的链接会自动分组显示
- 如果不指定分类，默认归类为"未分类"

**Docker部署说明**：首次启动容器时，如果映射的 `./data` 目录中没有 `links.txt` 文件，系统会自动创建一个包含示例链接的文件。

## 搜索功能

导航站内置了强大的搜索功能：
- 🔍 实时搜索：输入关键词即时显示匹配结果
- 🎯 多字段匹配：支持按网站名称、描述、分类搜索
- ⚡ 快速响应：优化的搜索算法，毫秒级响应
- 🔄 智能过滤：自动过滤空白和特殊字符

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
