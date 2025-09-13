FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制项目文件到nginx默认目录
COPY . .

# 创建links.txt备份文件，用于Docker启动时复制
RUN cp /usr/share/nginx/html/data/links.txt /usr/share/nginx/html/data/links.txt.backup

# 删除静态config.json文件，避免与环境变量冲突
RUN rm -f /usr/share/nginx/html/config.json

# 复制启动脚本
COPY entrypoint.sh /entrypoint.sh

# 设置脚本执行权限
RUN chmod +x /entrypoint.sh

# 环境变量定义
ENV SITE_TITLE="XG🧭导航" \
    SITE_DESCRIPTION="一个简洁、纯静态的个人导航站" \
    COPYRIGHT="© 2025 <a href='https://github.com/verkyer/xg-nav' target='_blank'>XG-Nav</a>" \
    CARD_CONTENT=0 \
    SHOW_FAVICON=1

# 暴露端口
EXPOSE 80

# 使用自定义启动脚本
ENTRYPOINT ["/entrypoint.sh"]