# 网站发布指南 (Publishing Guide)

您的《学生成长激励系统》是一个静态网站 (Static Website)，这使得它的发布非常灵活。您可以根据使用场景选择以下任意一种方式。

---

## 方案一：局域网发布 (推荐：绿联 NAS)

这是您之前正在尝试的方式，适合在学校/机构内部局域网访问，数据安全且速度快。

### 核心步骤回顾 (Apache 方式)
由于 Nginx 遇到权限问题，我们推荐使用 **Apache (httpd)**，它对 NAS 权限更宽容。

1.  **准备文件**：确保 `dist` 文件夹完整。
2.  **创建容器**：在绿联 Docker 中使用 `httpd:alpine` 镜像。
3.  **挂载目录**：
    *   主机：选择您的 `.../student-display/dist` 文件夹。
    *   容器：`/usr/local/apache2/htdocs` (注意路径)。
4.  **端口映射**：将容器 `80` 端口映射到 NAS 本地端口（如 `8081`）。
5.  **启动访问**：在浏览器输入 `http://<NAS_IP>:8081`。

> **提示**：如果在创建时遇到 `HTTPD_PATCHES` 变量报错，直接删除该变量行即可。

---

## 方案二：公网云发布 (Vercel / Netlify)

如果您希望家长或老师能在**任何地方**（不仅是校内）访问网站，推荐使用免费的静态托管服务。

### Vercel (推荐)
1.  注册 [Vercel.com](https://vercel.com)。
2.  安装 Vercel CLI 或直接在网页端操作。
3.  将 `dist` 文件夹拖入部署，或者连接您的 GitHub 仓库。
4.  Vercel 会自动分配一个 `https://your-project.vercel.app` 域名。

### 优势
*   自带 HTTPS 安全证书。
*   全球 CDN 加速。
*   完全免费（个人/小团队）。

---

## 方案三：临时快速预览 (Python)

如果您只是想在当前电脑上演示给别人看，无需安装 Docker。

1.  打开终端 (Terminal)。
2.  进入 `dist` 目录：
    ```bash
    cd /path/to/dist
    ```
3.  运行 Python 简易服务器：
    ```bash
    python3 -m http.server 8000
    ```
4.  浏览器访问 `http://localhost:8000`。

---

## 常见问题解答

**Q: 发布后刷新页面 404？**
*   **原因**：这是单页应用 (SPA) 的特性。
*   **NAS 解决**：使用我们提供的 `DEPLOY_ALTERNATIVE.md` 中的 `.htaccess` 文件（Apache）或 `nginx.conf`（Nginx）。
*   **Vercel 解决**：Vercel 会自动处理，通常无需配置，或者添加一个 `vercel.json` 路由规则。

**Q: 数据会丢失吗？**
*   **本地模式**：数据保存在**浏览器缓存 (LocalStorage)** 中。如果更换电脑访问，数据**不会同步**。
*   **云端模式**：如果您在“系统设置”中连接了 **Supabase** 数据库，那么无论通过 NAS 还是 Vercel 访问，只要输入正确的 API Key，数据都能实时同步。
