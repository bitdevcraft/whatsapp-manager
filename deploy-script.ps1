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
#   Adjust src/dest per your monorepo layout
$srcWeb = Join-Path $RepoPath "apps\web\.next"
$srcWebPublic = Join-Path $RepoPath "apps\web\public"
Robocopy $srcWeb      "$newRelease\apps\web\.next"      /MIR /MT:8
Robocopy $srcWebPublic   "$newRelease\apps\web\public"      /MIR /MT:8
Copy-Item "$RepoPath\apps\web\package.json" "$newRelease\apps\web"
Copy-Item "$RepoPath\apps\web\.env.local" "$newRelease\apps\web"

$srcWaService = Join-Path $RepoPath "apps\whatsapp-service\dist"
Robocopy $srcWaService      "$newRelease\apps\whatsapp-service\dist"      /MIR /MT:8
Copy-Item "$RepoPath\apps\whatsapp-service\package.json" "$newRelease\apps\whatsapp-service"
Copy-Item "$RepoPath\apps\whatsapp-service\.env" "$newRelease\apps\whatsapp-service"


Copy-Item "$RepoPath\package.json" $newRelease
Copy-Item "$RepoPath\pnpm-lock.yaml" $newRelease
Copy-Item "$RepoPath\pnpm-workspace.yaml" $newRelease
Copy-Item "$RepoPath\ecosystem.config.js" $newRelease
Copy-Item "$RepoPath\.npmrc" $newRelease

$srcPkgAuth = Join-Path $RepoPath "packages\auth\dist"
Robocopy $srcPkgAuth      "$newRelease\packages\auth\dist"      /MIR /MT:8
Copy-Item "$RepoPath\packages\auth\package.json" "$newRelease\packages\auth"

$srcPkgDB = Join-Path $RepoPath "packages\db\dist"
Robocopy $srcPkgDB      "$newRelease\packages\db\dist"      /MIR /MT:8
Copy-Item "$RepoPath\packages\db\package.json" "$newRelease\packages\db"

$srcPkgShared = Join-Path $RepoPath "packages\shared\dist"
Robocopy $srcPkgShared      "$newRelease\packages\shared\dist"      /MIR /MT:8
Copy-Item "$RepoPath\packages\shared\package.json" "$newRelease\packages\shared"

$srcPkgWaCloudAPI = Join-Path $RepoPath "packages\wa-cloud-api\dist"
Robocopy $srcPkgWaCloudAPI      "$newRelease\packages\wa-cloud-api\dist"      /MIR /MT:8
Copy-Item "$RepoPath\packages\wa-cloud-api\package.json" "$newRelease\packages\wa-cloud-api"

Push-Location "$newRelease"
pnpm install -F "./packages/wa-cloud-api" 
pnpm install --prod --frozen-lockfile -F "./apps/*" 
Pop-Location

$junction = Get-Item -Path "$DeployPath\current"
$oldRelease = (Get-Item $junction.Target).FullName

# Remove old link
Remove-Item "$DeployPath\current"
# Create new link
cmd /c "mklink /J `"$DeployPath\current`" `"$newRelease`""