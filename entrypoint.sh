#!/bin/sh

# 使用环境变量生成config.json
cat > /usr/share/nginx/html/config.json << EOF
{
  "SITE_TITLE": "${SITE_TITLE:-XG🧭导航}",
  "SITE_DESCRIPTION": "${SITE_DESCRIPTION:-一个简洁、纯静态的个人导航站}",
  "COPYRIGHT": "${COPYRIGHT:-© 2025 <a href='https://github.com/verkyer/xg-nav' target='_blank'>XG-Nav</a>}",
  "CARD_CONTENT": ${CARD_CONTENT:-1},
  "SHOW_FAVICON": ${SHOW_FAVICON:-1}
}
EOF

# 检查并复制示例links.txt文件
if [ ! -f "/usr/share/nginx/html/data/links.txt" ]; then
  echo "从镜像复制示例links.txt文件..."
  mkdir -p /usr/share/nginx/html/data
  # 从镜像内的备份位置复制links.txt文件
  if [ -f "/usr/share/nginx/html/data/links.txt.backup" ]; then
    cp /usr/share/nginx/html/data/links.txt.backup /usr/share/nginx/html/data/links.txt
  else
    # 如果备份文件不存在，创建默认内容
    cat > /usr/share/nginx/html/data/links.txt << 'EOF'
小鸽志,个人技术博客分享,https://www.xiaoge.org,博客
HKVPS,优质VPS推荐,https://hkvps.org,博客
DockerApps,Docker应用程序集合,https://dockerapps.com,博客
huanhq,技术大佬的blog,https://www.huanhq.com,博客
hicane,Cane's Blog,https://hicane.com,博客
淘宝,中国最大购物平台,https://www.taobao.com,购物
京东,中国知名电商平台,https://www.jd.com,购物
Amazon,全球最大电商平台,https://www.amazon.com,购物
天猫,品牌商城购物平台,https://www.tmall.com,购物
拼多多,社交电商购物平台,https://www.pinduoduo.com,购物
EOF
  fi
fi

# 启动nginx
nginx -g "daemon off;"