# Get connected wireless devices
$output = & adb mdns check
if ($output -match "ERROR") {
    Write-Host "Enabling mDNS discovery service..."
    & adb mdns services
}

# Discover devices via mDNS
Write-Host "Discovering devices..."
$devices = & adb mdns services
$serviceLines = $devices | Where-Object { $_ -match "android\.adbconnect\._tcp\." }

if (-not $serviceLines) {
    Write-Host "No wireless debugging devices found. Make sure wireless debugging is enabled on your device."
    exit 1
}

# Connect to the first available device
foreach ($line in $serviceLines) {
    if ($line -match "android\.adbconnect\._tcp\.\s+(\S+):(\d+)") {
        $ip = $matches[1]
        $port = $matches[2]
        
        Write-Host "Connecting to $ip:$port..."
        $result = & adb connect "$ip`:$port"
        
        if ($result -match "connected") {
            Write-Host "Successfully connected to $ip:$port"
            exit 0
        }
    }
}

Write-Host "Failed to connect to any device."
exit 1