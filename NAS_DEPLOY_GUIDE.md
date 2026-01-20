# 绿联 NAS (Docker) 部署指南

本指南将帮助您将《沐新青少年科创中心 - 学生成长激励系统》部署到绿联 (Ugreen) NAS 上。

由于这是一个静态网站 (Static Website)，最简单且最高效的方法是使用 Nginx 容器直接挂载网站文件。

## 准备工作

1.  **下载网站文件**：确保您已经下载了本项目的所有文件，特别是 `dist` 文件夹（这是构建好的网站成品）。
2.  **绿联 NAS**：确保您已经安装了 Docker 应用。

---

## 部署步骤 (推荐：挂载目录法)

这种方法不需要您自己构建 Docker 镜像，只需使用官方 Nginx 镜像并挂载文件即可。

### 1. 上传文件到 NAS

在您的绿联 NAS 文件管理器中（例如在 `Docker` 共享文件夹下），创建一个新文件夹，命名为 `student-display`。

将以下文件/文件夹上传到 `student-display` 文件夹中：
*   `dist` 文件夹 (整个文件夹上传)
*   `nginx.conf` 文件

上传后的目录结构应该如下所示：
```
/Docker/student-display/
├── dist/
│   ├── assets/
│   ├── index.html
│   └── ...
└── nginx.conf
```

### 2. 创建 Docker 容器

打开绿联 NAS 的 Docker 应用，进行如下操作：

1.  **镜像管理** -> **仓库** -> 搜索 `nginx` -> 下载 `latest` 或 `alpine` 版本。
2.  **容器管理** -> **添加容器**。
3.  **基本设置**：
    *   名称：`student-display`
    *   勾选：`高级模式` (如有)
    *   勾选：`开机自动启动`
    *   **(可选) 勾选：特权模式 (Privileged)** - 如果遇到权限问题，开启此项通常能解决。
4.  **存储空间 (关键步骤)**：
    *   点击“添加”来挂载卷。
    *   **挂载 1 (网站文件)**：
        *   主机路径：选择您刚才上传的 `/Docker/student-display/dist` 文件夹
        *   装载路径：`/usr/share/nginx/html`
        *   类型：只读 (可选)
    *   **挂载 2 (配置文件)**：
        *   主机路径：选择您刚才上传的 `/Docker/student-display/nginx.conf` 文件
        *   装载路径：`/etc/nginx/conf.d/default.conf`
        *   类型：只读 (可选)
5.  **端口设置**：
    *   本地端口：填写一个未被占用的端口，例如 `8088`
    *   容器端口：`80` (保持不变)
6.  **点击“下一步”或“应用”完成创建**。

### 3. 访问网站

部署完成后，在浏览器中输入：
`http://<您的NAS_IP>:8088`

例如：`http://192.168.31.100:8088`

---

## 故障排除 (Troubleshooting)

### 🔴 出现 403 Forbidden 错误？

这是最常见的问题，通常由**文件权限**或**挂载路径**引起。

**解决方法 1：检查挂载路径**
*   请仔细检查 Docker 存储空间设置。
*   **必须**将 `dist` 文件夹挂载到 `/usr/share/nginx/html`。
*   ❌ 错误：将 `student-display` 父文件夹挂载进去。
*   ✅ 正确：将 `student-display/dist` 子文件夹挂载进去。

**解决方法 2：检查文件权限**
1.  打开绿联 NAS 的 **文件管理器**。
2.  右键点击 `student-display` 文件夹 -> **属性/权限**。
3.  确保 **所有用户 (Everyone)** 或 **其他 (Others)** 拥有 **读取 (Read)** 权限。
4.  勾选 **应用到子文件夹**，保存并重启 Docker 容器。

---

## 进阶方法：使用 Docker Compose

如果您习惯使用 Docker Compose (在绿联 Docker 的“项目”或“堆栈”功能中)，可以使用以下配置：

```yaml
version: '3'
services:
  web:
    image: nginx:alpine
    container_name: student-display
    restart: always
    ports:
      - "8088:80"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
```

## 常见问题

**Q: 刷新页面后出现 404 错误？**
A: 这是单页应用 (SPA) 的常见问题。请确保您正确挂载了我们提供的 `nginx.conf` 文件，它包含了 `try_files $uri $uri/ /index.html;` 这行关键配置，用于处理路由。

**Q: 如何更新网站？**
A: 只需将新的 `dist` 文件夹上传覆盖 NAS 上的旧文件夹，然后重启容器即可。
