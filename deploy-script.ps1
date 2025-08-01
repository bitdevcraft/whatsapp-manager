param(
  [string]$RepoPath = ".\",
  [string]$DeployPath = "C:\deploy"
)

# 1. Prepare new release folder
$ts = Get-Date -Format "yyyyMMddHHmmss"
$newRelease = Join-Path $DeployPath "releases\$ts"
New-Item -ItemType Directory -Path $newRelease -Force | Out-Null

# 2. Pull latest code
Push-Location $RepoPath
git fetch --all
git checkout master
git pull origin master
Pop-Location

# 3. Install & build (Turborepo)
Push-Location $RepoPath
pnpm install --frozen-lockfile
npx turbo run build
Pop-Location

# 4. Copy artifacts
Copy-Item "$RepoPath\ecosystem.config.js" $newRelease

Push-Location $RepoPath
pnpm --filter=./apps/web deploy "$newRelease\apps\web"
pnpm --filter=./apps/whatsapp-service deploy "$newRelease\apps\whatsapp-service"
Pop-Location


$junction = Get-Item -Path "$DeployPath\current"
$oldRelease = (Get-Item $junction.Target).FullName

# Remove old link
Remove-Item "$DeployPath\current"
# Create new link
cmd /c "mklink /J `"$DeployPath\current`" `"$newRelease`""