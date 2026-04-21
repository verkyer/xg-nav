#!/bin/sh

# 使用环境变量生成config.json
cat > /usr/share/nginx/html/config.json << EOF
{
  "SITE_TITLE": "${SITE_TITLE:-XG🧭导航}",
  "SITE_DESCRIPTION": "${SITE_DESCRIPTION:-一个简洁、纯静态的个人导航站}",
  "COPYRIGHT": "${COPYRIGHT:-© 2026 <a href='https://github.com/verkyer/xg-nav' target='_blank'>XG-Nav</a> | <a href='editor.html'>Editor</a>}",
  "CARD_CONTENT": ${CARD_CONTENT:-1},
  "SHOW_FAVICON": ${SHOW_FAVICON:-1},
  "DEFAULT_ENGINE": "${DEFAULT_ENGINE:-bing}",
  "SEARCH_ENGINES": [
    { "name": "Bing", "engine": "bing", "url": "https://www.bing.com/search?q=" },
    { "name": "百度", "engine": "baidu", "url": "https://www.baidu.com/s?wd=" },
    { "name": "Google", "engine": "google", "url": "https://www.google.com/search?q=" },
    { "name": "DuckDuckGo", "engine": "duckduckgo", "url": "https://duckduckgo.com/?q=" },
    { "name": "GitHub", "engine": "github", "url": "https://github.com/search?q=" },
    { "name": "Docker", "engine": "docker", "url": "https://hub.docker.com/search?q=" }
  ]
}
EOF

mkdir -p /usr/share/nginx/html/data
mkdir -p /usr/share/nginx/html/ico

# 优先保证 links.yaml 存在；若不存在且存在 links.txt，进行转换为 YAML v2（分类为键）
if [ ! -f "/usr/share/nginx/html/data/links.yaml" ]; then
  if [ -f "/usr/share/nginx/html/data/links.yaml.backup" ]; then
    cp /usr/share/nginx/html/data/links.yaml.backup /usr/share/nginx/html/data/links.yaml
  elif [ -f "/usr/share/nginx/html/data/links.txt" ]; then
    echo "检测到 links.txt，转换为 YAML v2..."
    tmpcats="/tmp/xg-nav-cats.txt"
    rm -f "$tmpcats" && touch "$tmpcats"
    out="/usr/share/nginx/html/data/links.yaml"
    : > "$out"
    while IFS=',' read -r title description url category; do
      [ -z "$title" ] && continue
      [ -z "$category" ] && category="未分类"
      if ! grep -qxF "$category" "$tmpcats" 2>/dev/null; then
        echo "$category:" >> "$out"
        echo "  c-icon: favicon" >> "$out"
        echo "$category" >> "$tmpcats"
      fi
      if [ -n "$description" ]; then
        echo "  ${title}:" >> "$out"
        echo "    url: ${url}" >> "$out"
        echo "    desc: ${description}" >> "$out"
      else
        echo "  ${title}: ${url}" >> "$out"
      fi
    done < "/usr/share/nginx/html/data/links.txt"
  else
    echo "创建示例 links.yaml (YAML v2)..."
    cat > /usr/share/nginx/html/data/links.yaml << 'EOF'
博客:
  小鸽志: 
    url: https://www.xiaoge.org
    desc: 个人技术博客分享
    icon: # 留空则使用默认的 favicon（Yandex）
  DockerApps:
    url: https://dockerapps.com
    desc: Docker应用程序集合
    icon: emoji:🐳 #可以使用emoji
  GitHub:
    url: https://github.com
    desc: 全球最大的代码托管平台
    icon: github #使用本地图标 在/ico目录下，可以不用精确文件名
  huanhq:
    url: https://www.huanhq.com
    desc: 技术大佬的blog
  hicane:
    url: https://hicane.com
    desc: Cane's Blog
    icon: # 留空使用默认 favicon

购物:
  淘宝:
    url: https://www.taobao.com
    desc: 中国最大购物平台
    icon: url:https://www.taobao.com/favicon.ico # 远程图片
  京东:
    url: jd.com
    icon: url:https://www.jd.com/favicon.ico
    desc: 中国最大购物平台
  Amazon:
    url: https://www.amazon.com
    desc: 全球最大购物平台
  天猫:
    url: https://www.tmall.com
    desc: 品牌商城购物平台
  拼多多:
    url: https://www.pinduoduo.com
    desc: 社交电商购物平台
EOF
  fi
fi

# 启动nginx
nginx -g "daemon off;"
