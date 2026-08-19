$pending = @(
  "bilbao","burgos","caceres","cadiz","santander","castellon","ciudad-real",
  "cordoba","coruna","cuenca","girona","granada","guadalajara","donostia",
  "huelva","huesca","jaen","leon","lleida","logrono","lugo","madrid","malaga",
  "murcia","pamplona","ourense","palencia","las-palmas","pontevedra",
  "salamanca","santa-cruz","segovia","sevilla","soria","tarragona","teruel",
  "toledo","valencia","valladolid","zamora","zaragoza","ceuta","melilla"
)

$gap = 8000

foreach ($city in $pending) {
  Write-Host "=== $city ===" -ForegroundColor Cyan
  node scripts/import-spain-gyms.mjs --capitals --city $city
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FALLO $city (exit $LASTEXITCODE)" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds $gap
}
Write-Host "=== DONE ===" -ForegroundColor Green
