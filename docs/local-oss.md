# Local OSS Handover

Local OSS is a lightweight self-hosted file repository for HTML demo pages. It
stores files on this Windows machine, serves them through the Nest application,
and exposes them to the public internet through Cloudflare Tunnel.

## What It Does

- Stores uploaded HTML files under `D:\localoss`
- Serves public demo pages from `https://localoss.lshbosheth.cn`
- Provides management APIs for upload, list, update, rename, and delete
- Documents those APIs in the existing Nest Swagger page
- Runs Nest and Cloudflare Tunnel as separate native Windows scheduled tasks
- Uses Cloudflare Tunnel to publish the local Nest port without opening router
  ports

Example:

```text
D:\localoss\aa.html
```

is available as:

```text
https://localoss.lshbosheth.cn/aa
https://localoss.lshbosheth.cn/aa.html
```

## Components

```text
Browser / external website
  -> Cloudflare
  -> cloudflared tunnel on this PC
  -> Nest on http://127.0.0.1:1222
  -> D:\localoss
```

### Nest

Project:

```text
D:\lshbosheth\LshboshethNest
```

Local OSS code:

```text
src/local-oss/
```

Nest entry point:

```text
dist\src\main.js
```

Nest listens on:

```text
http://127.0.0.1:1222
```

### Cloudflare Tunnel

Tunnel config:

```text
C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\cloudflared-local-oss.yml
```

Important route:

```yaml
localoss.lshbosheth.cn -> http://127.0.0.1:1222
```

`cloudflared` is separate from Nest. It only forwards public traffic to the local
Nest port. Windows Task Scheduler starts and monitors both processes directly.

### Windows Task Scheduler

The two long-running tasks are:

```text
LocalOSS Nest Service
LocalOSS Cloudflare Tunnel
```

Check status:

```powershell
Get-ScheduledTask -TaskName "LocalOSS*"
```

## Environment

Required values in `.env`:

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

`LOCAL_OSS_TOKEN` protects all Local OSS management APIs. Do not expose it in a
public frontend bundle.

`ENABLE_DATABASE=auto` probes the local database port. If the database is not
available, DB-backed modules are skipped so Local OSS can still start. Use
`ENABLE_DATABASE=true` to force DB modules on, or `ENABLE_DATABASE=false` to
force them off.

## Public Routes

Public short routes are enabled only when the request host is:

```text
localoss.lshbosheth.cn
```

This prevents `api.lshbosheth.cn/aa` from being treated as a Local OSS file.

Examples:

```text
GET /aa       -> D:\localoss\aa.html
GET /aa.html  -> D:\localoss\aa.html
```

## Management APIs

Swagger:

```text
https://localoss.lshbosheth.cn/api/swagger
```

Bearer auth:

```http
Authorization: Bearer <LOCAL_OSS_TOKEN>
```

Main endpoints:

```text
POST   /api/local-oss/upload
POST   /api/local-oss/upload-json
GET    /api/local-oss/list
GET    /api/local-oss/:name
PUT    /api/local-oss/:name
PATCH  /api/local-oss/:name/rename
DELETE /api/local-oss/:name
```

In Swagger, click `Authorize` and enter the raw `LOCAL_OSS_TOKEN` value. Swagger
adds the `Bearer` prefix automatically.

## Startup

Windows Task Scheduler tasks:

```text
LocalOSS Nest Service
LocalOSS Cloudflare Tunnel
```

They execute directly:

```text
node.exe -> dist\src\main.js
cloudflared.exe -> localoss.lshbosheth.cn
```

The Tunnel automatically selects QUIC or HTTP/2 according to current network
availability. Nest starts 45 seconds after login and the Tunnel starts after 60
seconds. Both tasks run invisibly through `wscript.exe`, so no terminal window is
shown. They also trigger every five minutes for self-healing; an already running
process is not duplicated, while a stopped process is restored within about five
minutes. Startup no longer depends on PM2 or a versioned Microsoft Store
PowerShell path.

Manual start:

```powershell
pwsh -ExecutionPolicy Bypass -File "C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\start-localoss-nest.ps1"
```

Manual stop:

```powershell
pwsh -ExecutionPolicy Bypass -File "C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\stop-localoss-nest.ps1"
```

The task runs after Windows login, not before login.

## Updating Code

Source changes do not affect the running service until the project is rebuilt and
the Nest task is restarted.

```powershell
cd D:\lshbosheth\LshboshethNest
npm run build
Stop-ScheduledTask -TaskName "LocalOSS Nest Service"
Start-ScheduledTask -TaskName "LocalOSS Nest Service"
```

## Cloudflare / FlClash Notes

This PC uses FlClash. Cloudflare Tunnel can be affected by Fake-IP/TUN mode.

The Windows hosts file currently keeps Cloudflare Tunnel edge DNS away from
Fake-IP:

```text
198.41.192.27 region1.v2.argotunnel.com
198.41.200.33 region2.v2.argotunnel.com
```

If the tunnel starts returning Cloudflare `1033` or repeated TLS handshake
errors, check:

```powershell
Resolve-DnsName region1.v2.argotunnel.com
Resolve-DnsName region2.v2.argotunnel.com
```

They should not resolve to `198.18.x.x`.

## Troubleshooting

Check the scheduled tasks:

```powershell
Get-ScheduledTask -TaskName "LocalOSS*"
Get-ScheduledTaskInfo -TaskName "LocalOSS Nest Service"
Get-ScheduledTaskInfo -TaskName "LocalOSS Cloudflare Tunnel"
```

Check local Nest:

```powershell
curl http://127.0.0.1:1222/api/swagger
```

Check short route locally:

```powershell
curl -H "Host: localoss.lshbosheth.cn" http://127.0.0.1:1222/aa
```

Check Cloudflare Tunnel:

```powershell
C:\Users\EDY\Documents\Codex\2026-07-07\new-chat\work\tools\cloudflared.exe tunnel list
```

Common symptoms:

```text
Local Nest fails       -> LocalOSS Nest Service is not running or the app crashed
Public returns 1033    -> cloudflared is not connected to Cloudflare
Public returns 502     -> tunnel is connected but cannot reach Nest locally
Only browser fails     -> local proxy / FlClash / DNS issue
```

## Legacy

The old temporary Node static server on port `8787` is no longer needed. Local OSS
is now served by the Nest application on port `1222`.
