# ============================================================================
# Script: generate_receipts.ps1
# Generates realistic PNG & SVG test receipts for all ExpiryMate testing scenarios.
# Stores them in:
#  - ExpiryMate/test-receipts/
#  - ExpiryMate/client/public/test-receipts/
# ============================================================================

Add-Type -AssemblyName System.Drawing

$targetDirs = @(
    "C:\Users\riadh\.gemini\antigravity\scratch\ExpiryMate\test-receipts",
    "C:\Users\riadh\.gemini\antigravity\scratch\ExpiryMate\client\public\test-receipts"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

function Create-ReceiptImage {
    param (
        [string]$FileName,
        [string]$StoreName,
        [string]$StoreSubtitle,
        [string]$Gstin,
        [string]$InvoiceNo,
        [string]$Date,
        [string]$Customer,
        [string]$ProductName,
        [string]$ItemDetails,
        [double]$Price,
        [string]$PolicyText,
        [System.Drawing.Color]$HeaderColor
    )

    $width = 650
    $height = 850
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 250, 252))
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Card border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
    $g.DrawRectangle($borderPen, 15, 15, $width - 30, $height - 30)

    # Header Box
    $headerBrush = New-Object System.Drawing.SolidBrush($HeaderColor)
    $g.FillRectangle($headerBrush, 15, 15, $width - 30, 110)

    # Header Text
    $fontTitle = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Regular)
    $fontBold = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $fontRegular = New-Object System.Drawing.Font("Arial", 10.5, [System.Drawing.FontStyle]::Regular)
    $fontSmall = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Regular)
    $fontTotal = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $lightGrayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(224, 231, 255))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(79, 70, 229))

    $g.DrawString($StoreName.ToUpper(), $fontTitle, $whiteBrush, 35, 35)
    $g.DrawString($StoreSubtitle, $fontSub, $lightGrayBrush, 35, 75)
    $g.DrawString("GSTIN: $Gstin", $fontSub, $lightGrayBrush, 35, 95)

    # Metadata section
    $g.DrawString("Customer: $Customer", $fontBold, $darkBrush, 35, 150)
    $g.DrawString("Invoice No: $InvoiceNo", $fontRegular, $grayBrush, 35, 175)
    $g.DrawString("Date: $Date", $fontRegular, $grayBrush, 35, 198)

    # Divider
    $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1)
    $g.DrawLine($linePen, 35, 230, $width - 35, 230)

    # Table Header
    $g.DrawString("ITEM DESCRIPTION", $fontBold, $grayBrush, 35, 245)
    $g.DrawString("AMOUNT (INR)", $fontBold, $grayBrush, 470, 245)
    $g.DrawLine($linePen, 35, 275, $width - 35, 275)

    # Item Row
    $g.DrawString($ProductName, $fontBold, $darkBrush, 35, 295)
    $g.DrawString($ItemDetails, $fontSmall, $grayBrush, 35, 325)
    $priceFormatted = "Rs. {0:N2}" -f $Price
    $g.DrawString($priceFormatted, $fontBold, $darkBrush, 470, 295)

    # Middle divider
    $g.DrawLine($linePen, 35, 380, $width - 35, 380)

    # Subtotals & Tax Calculation
    $subtotal = $Price / 1.18
    $gst = $Price - $subtotal

    $g.DrawString("Subtotal (excl. tax):", $fontRegular, $grayBrush, 330, 410)
    $g.DrawString(("Rs. {0:N2}" -f $subtotal), $fontRegular, $darkBrush, 470, 410)

    $g.DrawString("CGST + SGST (18%):", $fontRegular, $grayBrush, 330, 435)
    $g.DrawString(("Rs. {0:N2}" -f $gst), $fontRegular, $darkBrush, 470, 435)

    $thickPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 41, 59), 2)
    $g.DrawLine($thickPen, 330, 465, $width - 35, 465)

    # Grand Total
    $g.DrawString("TOTAL AMOUNT:", $fontBold, $darkBrush, 300, 485)
    $g.DrawString($priceFormatted, $fontTotal, $accentBrush, 440, 480)

    # Policy Banner
    $bannerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 242, 255))
    $g.FillRectangle($bannerBrush, 35, 550, $width - 70, 130)
    $bannerBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(199, 210, 254), 1)
    $g.DrawRectangle($bannerBorder, 35, 550, $width - 70, 130)

    $policyTitleFont = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $policyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(67, 56, 202))
    $policyTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))

    $g.DrawString("OFFICIAL STORE WARRANTY & RETURN POLICY", $policyTitleFont, $policyBrush, 55, 570)
    
    $rect = New-Object System.Drawing.RectangleF([float]55, [float]600, [float]($width - 110), [float]70)
    $g.DrawString($PolicyText, $fontSmall, $policyTextBrush, $rect)

    # Footer note
    $g.DrawString("Thank you for shopping with us! Please retain this invoice for claims.", $fontSmall, $grayBrush, 130, 750)

    # Save to all destination directories
    foreach ($dir in $targetDirs) {
        $outPath = Join-Path $dir "$FileName.png"
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Created: $outPath"
    }

    $g.Dispose()
    $bmp.Dispose()
}

# 1. Apple Store BKC Mumbai — MacBook Air M3 (Scenario B: Active Warranty)
Create-ReceiptImage `
    -FileName "receipt-01-macbook-apple" `
    -StoreName "Apple BKC Mumbai" `
    -StoreSubtitle "Jio World Drive, Bandra Kurla Complex, Mumbai 400051" `
    -Gstin "27AAACA6171Q1ZS" `
    -InvoiceNo "APL-BKC-2026-88190" `
    -Date "15/10/2026" `
    -Customer "Priya Patel" `
    -ProductName "Apple MacBook Air M3 15-inch" `
    -ItemDetails "16GB Unified Memory, 512GB SSD Space Gray | Serial: C02G99XYMD6" `
    -Price 124900.00 `
    -PolicyText "14-Day Free Replacement Policy. 1-Year Apple Limited Hardware Warranty with complimentary technical phone support across all Apple Authorized Service Providers." `
    -HeaderColor ([System.Drawing.Color]::FromArgb(15, 23, 42))

# 2. Zara Phoenix Palladium — Blazer (Scenario C: Return Deadline Approaching)
Create-ReceiptImage `
    -FileName "receipt-02-zara-blazer" `
    -StoreName "ZARA Fashion Retail" `
    -StoreSubtitle "Phoenix Palladium Mall, Lower Parel, Mumbai 400013" `
    -Gstin "27AAACI1928K1Z3" `
    -InvoiceNo "ZAR-MUM-2026-44321" `
    -Date "10/10/2026" `
    -Customer "Aarav Sharma" `
    -ProductName "Men's Formal Tailored Wool Blazer" `
    -ItemDetails "Size: 40 | Color: Midnight Navy | SKU: 8432-109-402" `
    -Price 7990.00 `
    -PolicyText "7-Day Return and Exchange Window with original price tags attached. No returns accepted after the 7-day period expires." `
    -HeaderColor ([System.Drawing.Color]::FromArgb(67, 56, 202))

# 3. Reliance Digital — Samsung 4K TV (Scenario D: Warranty Expiring Soon)
Create-ReceiptImage `
    -FileName "receipt-03-samsung-tv" `
    -StoreName "Reliance Digital Electronics" `
    -StoreSubtitle "Infinity Mall, Malad West, Mumbai 400064" `
    -Gstin "27AAACR4567M1ZX" `
    -InvoiceNo "RD-MUM-2025-10294" `
    -Date "25/10/2025" `
    -Customer "Aarav Sharma" `
    -ProductName "Samsung 55-inch Crystal 4K UHD TV" `
    -ItemDetails "Model: UA55CUE60AKLXL | Serial: SN-SAM-55-9982310" `
    -Price 43990.00 `
    -PolicyText "1-Year Comprehensive Manufacturer Warranty on Product and Panel. Warranty claim must be lodged with authorized Samsung service center before anniversary." `
    -HeaderColor ([System.Drawing.Color]::FromArgb(2, 132, 199))

# 4. Amazon India — Prestige Induction Cooktop (Scenario E: Expired Warranty)
Create-ReceiptImage `
    -FileName "receipt-04-prestige-cooktop" `
    -StoreName "Amazon Retail India" `
    -StoreSubtitle "Fulfillment Center HYD-1, Telangana, India" `
    -Gstin "36AAACA1234D1Z2" `
    -InvoiceNo "AMZN-IND-2024-77189" `
    -Date "12/08/2024" `
    -Customer "Aarav Sharma" `
    -ProductName "Prestige PIC 20 1600W Induction Cooktop" `
    -ItemDetails "Push button controls, Indian menu preset | HSN: 851660" `
    -Price 2499.00 `
    -PolicyText "10-Day Replacement Window. 1-Year Domestic Manufacturer Warranty (Standard warranty period has expired)." `
    -HeaderColor ([System.Drawing.Color]::FromArgb(234, 88, 12))

# 5. Croma Retail — OnePlus 12 5G (Demo Seed Purchase)
Create-ReceiptImage `
    -FileName "receipt-05-oneplus12-croma" `
    -StoreName "Croma Electronics Store" `
    -StoreSubtitle "Oberoi Mall, Goregaon East, Mumbai 400063" `
    -Gstin "27AABCT2345A1Z5" `
    -InvoiceNo "CR-MUM-2026-99214" `
    -Date "10/10/2026" `
    -Customer "Aarav Sharma" `
    -ProductName "OnePlus 12 5G (16GB RAM, 512GB Storage)" `
    -ItemDetails "Silky Black | IMEI: 867392019482710 | HSN: 851713" `
    -Price 64999.00 `
    -PolicyText "7-Day Store Replacement for manufacturing defects. 1-Year Official OnePlus Brand Warranty valid across India." `
    -HeaderColor ([System.Drawing.Color]::FromArgb(16, 185, 129))

Write-Host "`nAll 5 Test Receipts generated successfully as high-resolution PNGs!"
