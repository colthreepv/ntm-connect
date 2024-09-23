# ntm-deviceportal

## Design

Website is on `portal.ntm-connect.online`, project running this is serverful.
When user clicks a salePoint, makes an ajax request to create-session for the specific subdomain, ex: `esi-maiorana-843d.ntm-connect.online/api/session`
This will create 2 sessions:

- JSESSIONID from device
- session from firebase

So serverful should have only:
/api/sale-points
/\* - website

proxy should have all the other endpoints

### Regarding development

Website is on `http://ntm-connect.local:3000`, project running this is web, it will proxy requests to serverful.
Also `proxy` project should be running.

When a user clicks a salePoint, shows a progress on the table, until it's green or red.
If green-light, the user can click again to open the portal in a new tab, redirecting to `http://esi-maiorana-843d.ntm-connect.local:3004/boss`

This requires the developer to have an etc/hosts file similar to this:

```text
127.0.0.1 ntm-connect.local
127.0.0.1 esi-magliana-0265.ntm-connect.local
127.0.0.1 esi-nettunense-8d37.ntm-connect.local
127.0.0.1 esi-monterotondo-383d.ntm-connect.local
127.0.0.1 esi-velletri-ebdd.ntm-connect.local
127.0.0.1 esi-aprilia-3f7a.ntm-connect.local
127.0.0.1 esi-romanina-c2dd.ntm-connect.local
```

### Locally test proxying

Use something like this

```bash
curl -vkL -H "Cookie: JSESSIONID=node01sdwb4l77sv941pqgn2qrat6s6818.node0;" https://94.138.189.89/boss/
```

### Setting up environment variables

1. Create a `.env.sh` file based on the `.env.example.sh` template.
2. Source the environment variables:

```bash
source .env.sh
```

```bash
pnpm i
pnpm dev
```

expected output:

```shell
$ pnpm dev

> ntm-connect@0.0.0-devonly dev /home/valerio/projects/valerio/ntm-devportal
> pnpm run -r dev

Scope: 5 of 6 workspace projects
packages/api dev$ tsx watch src/index.ts
│ No migrations to run
│ Server is running on port 3003
└─ Running...
packages/proxy dev$ tsx watch src/index.ts
│ No migrations to run
│ Server is running on port 3004
└─ Running...
packages/web dev$ next dev
│   ▲ Next.js 14.2.5
│   - Local:        http://localhost:3000
│   - Environments: .env.local
│  ✓ Starting...
│  ✓ Ready in 1720ms
└─ Running...
```

## Docker build

```shell
docker build -f docker/Dockerfile.proxy -t ntm-connect/proxy:latest .
```

```shell
docker build -f docker/Dockerfile.web -t ntm-connect/web:latest .
```
