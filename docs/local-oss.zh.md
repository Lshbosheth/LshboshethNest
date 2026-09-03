# Local OSS 交接文档

Local OSS 是一个轻量级的本机 HTML 页面仓库。它把文件存放在当前
Windows 电脑的 `D:\localoss` 目录，通过 Nest 服务读取和管理，再通过
Cloudflare Tunnel 暴露到公网。

## 它是做什么的

- 把上传的 HTML 页面保存到 `D:\localoss`
- 通过 `https://localoss.lshbosheth.cn` 公开访问这些页面
- 提供上传、列表、更新、重命名、删除等管理接口
- 管理接口会出现在现有 Nest Swagger 里
- Nest 服务和 Cloudflare Tunnel 分别由 Windows 计划任务直接守护
- Cloudflare Tunnel 负责把公网域名转发到本机 Nest 端口，不需要路由器端口映射

VPS 部署时将 `LOCAL_OSS_ROOT` 设置为 `/data/oss/demo`。服务器通用 OSS
项目使用同一数据盘的 `/data/oss` 根目录，但 Demo 上传内容只写入其 `demo`
子目录，彼此隔离。

例子：

```text
D:\localoss\aa.html
```

公网可访问：

```text
https://localoss.lshbosheth.cn/aa
https://localoss.lshbosheth.cn/aa.html
```

## 整体链路

```text
浏览器 / 外部网站
  -> Cloudflare
  -> 本机 cloudflared tunnel
  -> Nest: http://127.0.0.1:1222
  -> D:\localoss
```

## 组件说明

### Nest

项目目录：

```text
D:\lshbosheth\LshboshethNest
```

Local OSS 代码目录：

```text
src/local-oss/
```

Nest 启动入口：

```text
dist\src\main.js
```

Nest 本机端口：

```text
http://127.0.0.1:1222
```

### Cloudflare Tunnel

Tunnel 配置文件：

```text
C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\cloudflared-local-oss.yml
```

核心转发关系：

```yaml
localoss.lshbosheth.cn -> http://127.0.0.1:1222
```

`cloudflared` 和 Nest 是两个独立进程。Nest 负责业务，`cloudflared` 只负责公网转发；两者都由 Windows 计划任务直接启动。

### Windows 计划任务

两个常驻任务：

```text
LocalOSS Nest Service
LocalOSS Cloudflare Tunnel
```

查看状态：

```powershell
Get-ScheduledTask -TaskName "LocalOSS*"
```

## 环境变量

`.env` 中和 Local OSS 相关的配置：

```env
SERVICE_PORT=1222
LOCAL_OSS_ROOT=D:\localoss
LOCAL_OSS_PUBLIC_URL=https://localoss.lshbosheth.cn
LOCAL_OSS_PUBLIC_HOST=localoss.lshbosheth.cn
LOCAL_OSS_TOKEN=replace-with-a-private-token
ENABLE_DATABASE=auto
DB_TARGET=mysql
DB_RETRY_ATTEMPTS=1
DB_RETRY_DELAY=1000
```

`LOCAL_OSS_TOKEN` 用于保护所有 Local OSS 管理接口。不要把它直接写进公开前端代码里。

`ENABLE_DATABASE=auto` 会自动探测本机数据库端口。如果数据库不可用，会跳过依赖数据库的模块，让 Local OSS 仍然可以启动。

可选值：

```text
ENABLE_DATABASE=auto   自动探测本机数据库
ENABLE_DATABASE=true   强制加载数据库模块
ENABLE_DATABASE=false  强制跳过数据库模块
```

## 公开访问规则

短链接只在请求 Host 是下面这个域名时启用：

```text
localoss.lshbosheth.cn
```

这样可以避免：

```text
api.lshbosheth.cn/aa
```

被误判成 Local OSS 文件。

示例：

```text
GET /aa       -> D:\localoss\aa.html
GET /aa.html  -> D:\localoss\aa.html
```

## 管理接口

Swagger 地址：

```text
https://localoss.lshbosheth.cn/api/swagger
```

鉴权方式：

```http
Authorization: Bearer <LOCAL_OSS_TOKEN>
```

主要接口：

```text
POST   /api/local-oss/upload
POST   /api/local-oss/upload-json
GET    /api/local-oss/list
GET    /api/local-oss/:name
PUT    /api/local-oss/:name
PATCH  /api/local-oss/:name/rename
DELETE /api/local-oss/:name
```

在 Swagger 里点击右上角 `Authorize`，输入 `LOCAL_OSS_TOKEN` 的原始值即可，不需要手动加 `Bearer`，Swagger 会自动补。

## 开机启动

Windows 计划任务名称：

```text
LocalOSS Nest Service
LocalOSS Cloudflare Tunnel
```

任务直接执行：

```text
node.exe -> dist\src\main.js
cloudflared.exe -> localoss.lshbosheth.cn
```

Tunnel 使用自动协议选择，优先采用当前网络可用的 QUIC 或 HTTP/2。Nest 在登录 45 秒后启动，Tunnel 在登录 60 秒后启动。两个任务通过 `wscript.exe` 隐藏运行，不会弹出终端窗口；还会每 5 分钟触发一次自愈检查，进程正常运行时不会重复启动，进程退出后最迟约 5 分钟恢复。启动路径不再依赖 PM2 或 Microsoft Store PowerShell 的版本目录。

手动启动：

```powershell
pwsh -ExecutionPolicy Bypass -File "C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\start-localoss-nest.ps1"
```

手动停止：

```powershell
pwsh -ExecutionPolicy Bypass -File "C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\stop-localoss-nest.ps1"
```

注意：计划任务是在登录 Windows 后执行，不是电脑开机但停留在登录界面时执行。

## 更新代码

修改 `src` 源码不会立刻影响正在运行的服务。需要重新构建并重启 Nest 任务：

```powershell
cd D:\lshbosheth\LshboshethNest
npm run build
Stop-ScheduledTask -TaskName "LocalOSS Nest Service"
Start-ScheduledTask -TaskName "LocalOSS Nest Service"
```

## Cloudflare / FlClash 注意事项

当前电脑使用 FlClash。Cloudflare Tunnel 可能会被 Fake-IP/TUN 模式影响。

Windows hosts 文件中保留了 Cloudflare Tunnel edge 的 DNS 兜底：

```text
198.41.192.27 region1.v2.argotunnel.com
198.41.200.33 region2.v2.argotunnel.com
```

如果公网返回 Cloudflare `1033`，或者日志里反复出现 TLS handshake 错误，先检查：

```powershell
Resolve-DnsName region1.v2.argotunnel.com
Resolve-DnsName region2.v2.argotunnel.com
```

它们不应该解析到：

```text
198.18.x.x
```

## 故障排查

检查计划任务：

```powershell
Get-ScheduledTask -TaskName "LocalOSS*"
Get-ScheduledTaskInfo -TaskName "LocalOSS Nest Service"
Get-ScheduledTaskInfo -TaskName "LocalOSS Cloudflare Tunnel"
```

检查本机 Nest：

```powershell
curl http://127.0.0.1:1222/api/swagger
```

检查本机短链接：

```powershell
curl -H "Host: localoss.lshbosheth.cn" http://127.0.0.1:1222/aa
```

检查 Cloudflare Tunnel：

```powershell
C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\tools\cloudflared.exe tunnel list
```

常见现象：

```text
本机 Nest 不通       -> LocalOSS Nest Service 任务没运行，或 Nest 崩了
公网返回 1033        -> cloudflared 没连上 Cloudflare
公网返回 502         -> tunnel 在线，但访问不到本机 Nest
只有浏览器打不开     -> 本机代理 / FlClash / DNS 问题
```

## 旧方案

旧的临时 Node 静态服务使用端口 `8787`，现在不再需要。Local OSS 已经迁移到 Nest 服务，端口是 `1222`。
