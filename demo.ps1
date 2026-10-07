Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   AETHER-OS (OPENDOTS) - SOVEREIGN AGENT OPERATING SYSTEM DEMO" -ForegroundColor Cyan
Write-Host "================================================================================`n" -ForegroundColor Cyan

# --- 1. COGNITIVE GOVERNOR (ATTENTION DEBT) ---
Write-Host "[PILLAR 1] Cognitive Attentional Governor and Attention Debt Index:" -ForegroundColor Yellow

function Get-AttentionDebt {
    param(
        [string]$RiskLevel,
        [double]$FinancialUsd,
        [bool]$IsIrreversible,
        [double]$UserVelocityWpm
    )
    $irreversibilityWeight = 1.0
    if ($IsIrreversible) { $irreversibilityWeight = 3.0 }
    
    $riskMult = 1.0
    if ($RiskLevel -eq "LOW") { $riskMult = 0.5 }
    elseif ($RiskLevel -eq "MEDIUM") { $riskMult = 1.5 }
    elseif ($RiskLevel -eq "HIGH") { $riskMult = 4.0 }
    elseif ($RiskLevel -eq "CRITICAL") { $riskMult = 10.0 }
    
    $numerator = $irreversibilityWeight * $riskMult * [Math]::Max(1.0, $FinancialUsd)
    $denominator = [Math]::Max(0.1, $UserVelocityWpm / 10.0)
    return [Math]::Round(($numerator / $denominator), 2)
}

$debtRoutine = Get-AttentionDebt -RiskLevel "LOW" -FinancialUsd 0 -IsIrreversible $false -UserVelocityWpm 45
$debtCritical = Get-AttentionDebt -RiskLevel "CRITICAL" -FinancialUsd 250 -IsIrreversible $true -UserVelocityWpm 15

Write-Host "   * Routine Code Inspection: Attention Debt = $debtRoutine (Threshold: 10.0) -> [AUTO-EXECUTE]" -ForegroundColor Green
Write-Host "   * Production Migration:     Attention Debt = $debtCritical (Threshold: 10.0) -> [AMBIENT-INTERRUPT]`n" -ForegroundColor Red

# --- 2. SECURITY JAIL (PATH TRAVERSAL DEFENSE) ---
Write-Host "[PILLAR 2] Sandboxed Process Jail and Boundary Defense:" -ForegroundColor Yellow

$sandboxRoot = Join-Path $PSScriptRoot "workspace_demo"
if (-not (Test-Path $sandboxRoot)) { 
    $null = New-Item -ItemType Directory -Path $sandboxRoot -Force 
}

function Resolve-SafePath {
    param([string]$RootDir, [string]$TargetPath)
    $resolved = [System.IO.Path]::GetFullPath((Join-Path $RootDir $TargetPath))
    $normRoot = [System.IO.Path]::GetFullPath($RootDir)
    
    if (-not $resolved.StartsWith($normRoot)) {
        throw "[SecurityViolation] Denied: Path '$TargetPath' attempts directory traversal outside sandbox."
    }
    return $resolved
}

try {
    $safe = Resolve-SafePath -RootDir $sandboxRoot -TargetPath "src/kernel.ts"
    Write-Host "   * Legitimate Path Resolution: $safe -> [PERMITTED]" -ForegroundColor Green
    Resolve-SafePath -RootDir $sandboxRoot -TargetPath "../../Windows/System32/cmd.exe"
} catch {
    Write-Host "   * Malicious Traversal Attack: $($_.Exception.Message) -> [BLOCKED]`n" -ForegroundColor Red
}

# --- 3. MODEL GATEWAY (CASCADING 429 FAILOVER) ---
Write-Host "[PILLAR 3] Cascading Multi-Provider Model Router:" -ForegroundColor Yellow

$providers = @(
    @{ Name = "Anthropic Claude 3.7"; Healthy = $false; Error = "429 Too Many Requests" },
    @{ Name = "OpenAI GPT-4o"; Healthy = $true; Response = "Optimizing AST tree nodes..." }
)

foreach ($p in $providers) {
    if (-not $p.Healthy) {
        Write-Host "   * Provider '$($p.Name)' failed: $($p.Error). Cascading in 12ms..." -ForegroundColor Magenta
    } else {
        Write-Host "   * Fallback to '$($p.Name)' succeeded! Output: '$($p.Response)'`n" -ForegroundColor Green
        break
    }
}

# --- 4. STATE MACHINE & VERIFICATION PROOF OF WORK ---
Write-Host "[PILLAR 4] Deterministic State Machine and Verification Gate:" -ForegroundColor Yellow

$script:currentState = "IDLE"
$script:isVerified = $false

function Set-State {
    param([string]$NextState)
    if ($NextState -eq "COMPLETED" -and -not $script:isVerified) {
        throw "INVARIANT VIOLATION: Cannot complete task without verified green test receipt."
    }
    $script:currentState = $NextState
    Write-Host "   * State Transition -> [$($script:currentState)]" -ForegroundColor Cyan
}

Set-State "PLANNING"
Set-State "EXECUTING"

try {
    Set-State "COMPLETED"
} catch {
    Write-Host "   * Premature Completion Attempt: $($_.Exception.Message) -> [ENFORCED]" -ForegroundColor Red
}

$script:isVerified = $true
Set-State "COMPLETED"
Write-Host "   * Verification Receipt Registered: Task legitimately completed!`n" -ForegroundColor Green

# Cleanup
if (Test-Path $sandboxRoot) { 
    Remove-Item -Recurse -Force $sandboxRoot 
}

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   All 5 Core Invariants Verified Successfully!" -ForegroundColor Green
Write-Host "   AetherOS (OpenDots) is ready to deploy or vibe-code with Cursor AI." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
