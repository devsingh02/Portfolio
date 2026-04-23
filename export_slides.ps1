Add-Type -AssemblyName 'Microsoft.Office.Interop.PowerPoint' -ErrorAction SilentlyContinue
$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

# Export Samsung PRISM PPT
$pres = $pptApp.Presentations.Open("c:\Users\LENOVO\OneDrive\Desktop\Portfolio\Samsung_PRISM_in depth ppt.pptx")
$slideCount = $pres.Slides.Count
Write-Output "Samsung PRISM Total slides: $slideCount"
$outputDir = "c:\Users\LENOVO\OneDrive\Desktop\Portfolio\assets\samsung_prism_slides"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
for ($i = 1; $i -le $slideCount; $i++) {
    $slide = $pres.Slides.Item($i)
    $exportPath = Join-Path $outputDir "slide_$i.png"
    $slide.Export($exportPath, "PNG", 1280, 720)
    Write-Output "Exported Samsung slide $i"
}
$pres.Close()

# Export Projects PPT
$pres2 = $pptApp.Presentations.Open("c:\Users\LENOVO\OneDrive\Desktop\Portfolio\Presentation of some cool projects i made once.ppt")
$slideCount2 = $pres2.Slides.Count
Write-Output "Projects PPT Total slides: $slideCount2"
$outputDir2 = "c:\Users\LENOVO\OneDrive\Desktop\Portfolio\assets\projects_slides"
New-Item -ItemType Directory -Force -Path $outputDir2 | Out-Null
for ($i = 1; $i -le $slideCount2; $i++) {
    $slide2 = $pres2.Slides.Item($i)
    $exportPath2 = Join-Path $outputDir2 "slide_$i.png"
    $slide2.Export($exportPath2, "PNG", 1280, 720)
    Write-Output "Exported Projects slide $i"
}
$pres2.Close()

$pptApp.Quit()
Write-Output "Done exporting all slides!"
