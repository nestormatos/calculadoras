$files = @(
  'E:\0_programacion_avanzada\Miniapps\calculadoras\travel-altitude-hydration\index.html',
  'E:\0_programacion_avanzada\Miniapps\calculadoras\alcohol-caffeine\index.html',
  'E:\0_programacion_avanzada\Miniapps\calculadoras\urine-color-guide\index.html'
)
$i = 0
foreach ($f in $files) {
  $i++
  $html = [IO.File]::ReadAllText($f)
  $at = ([regex]::Matches($html, '@@')).Count
  $open = ([regex]::Matches($html, '<div(\s|>)')).Count
  $close = ([regex]::Matches($html, '</div>')).Count
  $blocks = [regex]::Matches($html, '(?s)<script>(.*?)</script>')
  $j = 0
  $jsOk = $true
  foreach ($b in $blocks) {
    $j++
    $tmp = Join-Path $env:TEMP ("ph_check_{0}_{1}.js" -f $i, $j)
    [IO.File]::WriteAllText($tmp, $b.Groups[1].Value)
    $out = node --check $tmp 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { $jsOk = $false; Write-Output ("JS ERROR in {0} block {1}:`n{2}" -f $f, $j, $out) }
  }
  $name = Split-Path (Split-Path $f -Parent) -Leaf
  Write-Output ("{0}: @@={1} divOpen={2} divClose={3} inlineScripts={4} jsSyntaxOK={5}" -f $name, $at, $open, $close, $j, $jsOk)
}
