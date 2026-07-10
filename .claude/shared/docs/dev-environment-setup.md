# Dev environment setup — joining the self-hosted runner fleet

How to bring a new machine (dev box or CI runner) up to the point where
`bash .claude/shared/scripts/validate.sh` and the `standards` GitHub Actions workflow can both
run. `repo-and-delivery.md` assumes this is already true; this doc is how to make it true.
Nothing here is repo-specific — repeat it on any host that joins the fleet.

## Node.js + pnpm

Install via `nvm` (avoids relying on a distro-packaged Node, which is usually too old):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install --lts
```

**Gotcha:** most distros' `~/.bashrc` has an early `case $- in *i*) ;; *) return;; esac` guard
that skips the nvm-sourcing lines for **non-interactive** shells — which is exactly how CI
runners and headless tool invocations (this pattern's `run-agent.sh`, `validate.sh`, etc.) spawn
their shells. Sourcing `nvm.sh` alone is not enough. Symlink the active Node install into
`/usr/local/bin` (on `PATH` for every shell, interactive or not) instead of relying on nvm's own
per-shell activation:

```bash
NODE_BIN_DIR="$(dirname "$(nvm which default)")"
for bin in node npm npx corepack; do sudo ln -sf "$NODE_BIN_DIR/$bin" "/usr/local/bin/$bin"; done
sudo /usr/local/bin/corepack enable --install-directory /usr/local/bin   # provides pnpm/pnpx/yarn
```

Verify with a **non-interactive, non-login** shell (the mode CI/tooling actually uses), not just
your interactive terminal: `bash -c 'node -v && pnpm -v'`.

## Docker (local Postgres via `docker compose`)

Two working paths — pick based on what's actually available:

- **Docker Desktop WSL integration** (if already installed on the Windows host): toggle it on
  for the distro in Docker Desktop's settings, **then restart the WSL distro or Docker Desktop**
  — the CLI-tools mount at `/mnt/wsl/docker-desktop/cli-tools/` is not populated live on an
  already-running distro, so `docker` stays "command not found" until that restart happens (a
  Windows-side action, not fixable from inside WSL).
- **Native `docker.io` (fallback used on this machine, works immediately, no restart needed):**
  ```bash
  sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
  sudo usermod -aG docker "$USER"   # avoids needing sudo for every `docker` call
  ```
  This runs its own `dockerd` via systemd (`wsl.conf` needs `[boot] systemd=true`), independent
  of Docker Desktop. Fine to run alongside Desktop; just be aware there are then two possible
  Docker backends on the machine.

## Self-hosted GitHub Actions runner

`standards.yml` targets `runs-on: [self-hosted, Linux, X64]` — a repo/org with **zero runners
registered** leaves every PR's checks stuck in `pending` forever (not a slow build — nothing is
running). Registering one:

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
V=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -o runner.tar.gz -L "https://github.com/actions/runner/releases/download/v${V}/actions-runner-linux-x64-${V}.tar.gz"
tar xzf runner.tar.gz

TOKEN=$(gh api -X POST repos/<owner>/<repo>/actions/runners/registration-token --jq .token)
./config.sh --url https://github.com/<owner>/<repo> --token "$TOKEN" \
  --name "$(hostname)" --labels self-hosted,Linux,X64 --work _work --unattended --replace

sudo ./svc.sh install "$USER" && sudo ./svc.sh start   # persists across reboots/logouts
```

`gh api ... registration-token` needs an authenticated `gh` with admin on the repo (`gh auth
status` — `repo` scope, `permissions.admin: true` on the repo). Confirm it registered and is
online: `gh api repos/<owner>/<repo>/actions/runners` should show `"status": "online"`.

The runner inherits its `PATH` from the environment `svc.sh install` ran in — confirm
`/usr/local/bin` (Node/pnpm) and `/usr/bin` (docker, from the native-install path above) both
precede any Windows-mount paths (`/mnt/c/...`) in it, or CI jobs will silently pick up the wrong
binaries.

**Gotcha — `docker.socket`/`docker.service` ordering after a restart:** on this WSL host,
restarting `docker.service` alone sometimes leaves `dockerd` logging `API listen on
/run/docker.sock` while the socket file is actually absent (`ss -xlp` shows it bound with an
inode; `ls`/`stat`/`docker ps` all say "No such file or directory" — a stale socket-activation
handoff, not a permissions issue). Fix: stop both units, start `docker.socket` **first**, confirm
the socket file exists, **then** start `docker.service`:

```bash
sudo systemctl stop docker.service docker.socket
sudo systemctl start docker.socket   # confirm: ls -la /run/docker.sock
sudo systemctl start docker.service
```

## SQL Server tooling (for the `ai-db-engine-conversion` pipeline — Task 1)

`pyodbc` (the pipeline's source driver) needs the platform ODBC Driver 18, and restoring a
`.bacpac` (Azure SQL's schema+data export format — different from a native `.bak`, which needs a
plain `RESTORE DATABASE` instead) needs `sqlpackage`:

```bash
curl -sSL -O https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb
sudo apt-get update -qq
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev unixodbc mssql-tools18

mkdir -p ~/tools/sqlpackage && cd ~/tools/sqlpackage
curl -sSL -o sqlpackage.zip https://aka.ms/sqlpackage-linux
sudo apt-get install -y unzip && unzip -q sqlpackage.zip && chmod +x sqlpackage
```

`python3 -m venv` also needs its distro package first (`sudo apt-get install -y
python3.12-venv` — the "ensurepip is not available" error otherwise) before
`ai-db-engine-conversion`'s own venv setup (see its `SETUP.md`) will succeed.

**Restoring a `.bacpac` against a local, disposable SQL Server** (used in place of a live/VPN
connection to the real server, when none is available):

```bash
docker run -d --name <name> -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD="<random, local-only>" \
  -p 14330:1433 mcr.microsoft.com/mssql/server:2022-latest
~/tools/sqlpackage/sqlpackage /Action:Import /SourceFile:"<path>.bacpac" \
  /TargetServerName:"localhost,14330" /TargetDatabaseName:"<db>" \
  /TargetUser:sa /TargetPassword:"<sa password>" /TargetTrustServerCertificate:True
```

Then create a **read-only** login for the pipeline itself (never point it at `sa` — the
conversion's own read-only discipline should hold even against a disposable local source):

```sql
CREATE LOGIN dbconv_reader WITH PASSWORD = '<random>', CHECK_POLICY = OFF;
USE [<db>]; CREATE USER dbconv_reader FOR LOGIN dbconv_reader;
ALTER ROLE db_datareader ADD MEMBER dbconv_reader; GRANT VIEW DEFINITION TO dbconv_reader;
```
