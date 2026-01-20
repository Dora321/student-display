# 备用方案：使用 Apache (httpd) 部署

如果您在使用 Nginx 时持续遇到 **403 Forbidden** 权限问题，建议尝试使用 **Apache (httpd)** 镜像。它对文件权限的要求通常比 Nginx 更宽松，更适合 NAS 环境。

---

## 步骤 1：下载镜像

1.  打开绿联 Docker。
2.  搜索并下载镜像：`httpd:alpine`。

## 步骤 2：创建容器

1.  **添加容器**，选择 `httpd:alpine`。
2.  **名称**：例如 `student-display-apache`。
3.  **存储空间（挂载）**：
    *   主机路径：选择包含网站文件的 `dist` 文件夹 (例如 `/Docker/student-display/dist`)。
    *   装载路径：`/usr/local/apache2/htdocs`
    *   ⚠️ **注意**：Apache 的默认路径是 `/usr/local/apache2/htdocs`，这与 Nginx 不同。
4.  **端口设置**：
    *   本地端口：`8081` (或者其他未被占用的端口)。
    *   容器端口：`80`。
5.  **启动容器**。

## 步骤 3：配置路由（解决刷新 404 问题）

Apache 默认不支持单页应用 (SPA) 的路由重写（刷新页面变 404）。如果您遇到这个问题，需要启用 `.htaccess`。

**简单方法**：
如果您不熟悉 Apache 配置，且仅在内网使用，通常直接访问首页即可。如果需要完美支持刷新，建议继续尝试修复 Nginx 权限，或者在 `dist` 目录中创建一个 `.htaccess` 文件，内容如下：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
将此文件上传到 NAS 的 `dist` 文件夹中即可。
