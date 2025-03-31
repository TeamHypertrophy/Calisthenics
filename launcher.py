import sys
import time
import os
import datetime
import platform
import subprocess
import requests
import psutil
import humanize

from ascii import ASCII_LOGO, ADB_LOGO, BUN_LOGO, NGROK_LOGO, PROTEIN_LOGO, PSQL_LOGO, WSL_LOGO, print_line, print_error
from rich.console import Console

console = Console(color_system="windows", force_terminal=True)

def WaitAndExit(message) -> SystemExit:
    time.sleep(2)
    os.system("cls")
    print_error(console=console)
    print_line(color='red')
    console.print(f"[red]{message}[/red]")
    time.sleep(5)
    raise SystemExit

if sys.platform != "win32":
    WaitAndExit("THIS LAUNCHER CAN ONLY BE USED ON WINDOWS")

WINDOW_TITLE = "[Hypertrophy] - Launcher"

os.system(f"cls && title {WINDOW_TITLE}")

console.print(ASCII_LOGO, justify="full")
console.print(
    f"\n[blue3]WELCOME TO THE Hypertrophy LAUNCHER[/blue3] [purple]{os.getlogin()}[/purple]\n\n"
, justify="center")

print_line(console=console)

boot_time_timestamp = psutil.boot_time()
bt = datetime.datetime.fromtimestamp(boot_time_timestamp)

console.print(
    f"[blue3]Current Path:[/blue3] [purple]{os.path.abspath(os.getcwd())}[/purple]\n"
)

console.print(f"[blue3]OS[/blue3]: [purple]{platform.uname().system}[/purple]")
console.print(f"[blue3]OS Version[/blue3]: [purple]{platform.uname().version}[/purple]")
console.print(f"[blue3]Release[/blue3]: [purple]{platform.uname().release}[/purple]")
console.print(
    f"[blue3]Processor[/blue3]: [purple]{platform.uname().processor}[/purple]"
)
console.print(
    f"[blue3]Python Version[/blue3]: [purple]{platform.python_version()}[/purple]"
)
console.print(
    f"[blue3]Boot Time[/blue3]: [purple]{bt.year}/{bt.month}/{bt.day} {bt.hour}:{bt.minute}:{bt.second}[/purple]"
)

print_line(console=console)

vmem = psutil.virtual_memory()

console.print(
    f"[blue3]Total Memory[/blue3]: [purple]{humanize.naturalsize(vmem.total)}[/purple]"
)
console.print(
    f"[blue3]Available[/blue3]: [purple]{humanize.naturalsize(vmem.available)}[/purple]"
)
console.print(f"[blue3]Percent[/blue3]: [purple]{vmem.percent}%[/purple]")
console.print(
    f"[blue3]Used[/blue3]: [purple]{humanize.naturalsize(vmem.used)}[/purple]"
)
console.print(
    f"[blue3]Free[/blue3]: [purple]{humanize.naturalsize(vmem.free)}[/purple]"
)

print_line(console=console)

console.print(PSQL_LOGO, justify="full")

console.print("[blue3] Checking IF PSQL Service is Running[/blue3]")

try:
    check_result = subprocess.run(
        ["sc", "query", "postgresql-x64-17"], check=True, capture_output=True
    )
    service_output = check_result.stdout.decode("utf-8")

    if "STATE" in service_output and "RUNNING" in service_output:
        console.print("[green] PostgreSQL Service is [bold]RUNNING[/bold][/green]")
        postgresql_running = True
    else:
        console.print("[red] PostgreSQL Service is [bold]NOT RUNNING[/bold][/red]")
        postgresql_running = False

        # Try to start the service if it's not running
        console.print("[yellow] Attempting to start PostgreSQL service...[/yellow]")
        try:
            start_result = subprocess.run(
                ["net", "start", "postgresql-x64-17"], check=True, capture_output=True
            )
            console.print("[green] Service start command executed successfully.[/green]")

            # Wait a moment and check again
            time.sleep(3)

            # Verify service started
            check_again = subprocess.run(
                ["sc", "query", "postgresql-x64-17"], check=True, capture_output=True
            ).stdout.decode("utf-8")

            if "STATE" in check_again and "RUNNING" in check_again:
                console.print(
                    "[green] PostgreSQL Service is now [bold]RUNNING[/bold][/green]"
                )
                postgresql_running = True
            else:
                console.print("[red] Failed to start PostgreSQL service.[/red]")
                console.print(
                    "[yellow] You may need to start it manually from Services.[/yellow]"
                )
                postgresql_running = False
        except subprocess.CalledProcessError as e:
            console.print(f"[red] Error starting service: {e}[/red]")
            postgresql_running = False

except subprocess.CalledProcessError as e:
    console.print(f"[red] Error checking PostgreSQL service: {e}[/red]")
    postgresql_running = False

print_line(console=console)

console.print(WSL_LOGO, justify="full")

console.print("[blue3] Checking If WSL is Running [/blue3]")

wsl_running = "wslhost.exe" in (p.name() for p in psutil.process_iter())

if wsl_running:
    console.print("[green] WSL is Running[/green]")
else:
    console.print("[red] WSL is not running, running now[/red]")

    result = subprocess.run(
        ["wsl", "--distribution", "Ubuntu", "--exec", "dbus-launch", "true"], check=True, capture_output=True
    )

    time.sleep(10)

    wsl_again = "wslhost.exe" in (p.name() for p in psutil.process_iter())

    if wsl_again:
        console.print("[green] WSL Successfully Started[/green]")
    else:
        console.print("[red] WSL Did Not Start Successfully[/red]")
        raise SystemExit

print_line(console=console)

console.print(PROTEIN_LOGO, justify="full")

console.print("[blue3] Checking If Protein is Running [/blue3]")

protein_running = "protein.exe" in (p.name() for p in psutil.process_iter())

if protein_running:
    console.print("[green] Protein Is Running[/green]")
else:
    console.print("[yellow] Protein Is Not Running, Waiting For Protein To Start...[/yellow]")
    
    max_wait_time = 120
    check_interval = 2
    elapsed_time = 0

    with console.status("[yellow] Waiting for protein.exe to start...[/yellow]") as status:
        while elapsed_time < max_wait_time:
            # Update status message with elapsed time
            status.update(f"[yellow] Waiting for protein.exe to start... ({elapsed_time}/{max_wait_time}s)[/yellow]")
            
            # Check if process is running
            if "protein.exe" in (p.name() for p in psutil.process_iter()):
                protein_running = True
                break
            
            # Wait for the interval
            time.sleep(check_interval)
            elapsed_time += check_interval
    
    # Final check and status message
    if protein_running:
        console.print("[green] Protein Started Successfully[/green]")
    else:
        console.print("[red] Timed out waiting for Protein to start[/red]")
        
        console.print("[red] Exiting launcher - Protein is required but not running[/red]")
        raise SystemExit

print_line(console=console)

console.print(NGROK_LOGO, justify="full")

console.print("[blue3] Checking If Ngrok Reverse Proxy is Running")

attempt = requests.get("https://live-pig-nearby.ngrok-free.app")
ngrok_running = False

if attempt.status_code == 404:
    console.print("[red] Ngrok Reverse Proxy Not Started, Waiting For Proxy to Start...")

    max_wait_time = 120
    check_interval = 8
    elapsed_time = 0

    with console.status("[yellow] Waiting for Ngrok Reverse Proxy to start...[/yellow]") as status:
        while elapsed_time < max_wait_time:
            # Update status message with elapsed time
            status.update(f"[yellow] Waiting for NGROK Reverse Proxy to start... ({elapsed_time}/{max_wait_time}s)[/yellow]")
            
            # Check if process is running
            attempt = requests.get("https://live-pig-nearby.ngrok-free.app")

            if attempt.status_code != 404:
                ngrok_running = True
                break
            
            # Wait for the interval
            time.sleep(check_interval)
            elapsed_time += check_interval
    
    # Final check and status message
    if ngrok_running:
        console.print("[green] Ngrok Started Successfully[/green]")
    else:
        console.print("[red] Timed out waiting for Ngrok to start[/red]")
        console.print("[red] Exiting launcher - Ngrok is required but not running[/red]")
        raise SystemExit
else:
    console.print("[green] Ngrok Reverse Proxy Started [/green]")

print_line(console=console)

console.print(ADB_LOGO, justify="full")

console.print("[blue3] Checking If ADB Server Has Started")

adb_running = "adb.exe" in (p.name() for p in psutil.process_iter())

if adb_running:
    console.print("[green] ADB Sucessfully Started[/green]")
else:
    console.print("[red] ADB Not Running, Starting..[/red]")

    result = subprocess.run(
        ["adb", "start-server"], check=True, capture_output=True
    )

    time.sleep(5)

    check_again = "adb.exe" in (p.name() for p in psutil.process_iter())

    if check_again:
        console.print("[green] ADB Started Successfully [/green]")
    else:
        console.print("[red] ADB Failed To Start [/red]")
        raise SystemExit
    
ip_input = console.input("[blue3] Enter ADB IP: [/blue3]")
port_input = console.input("[blue3] Enter ADB Port: [/blue3]")

console.print(f"[blue3] Connecting To Device Using [red]{ip_input}:{port_input}[/red] [/blue3]")

result = subprocess.run(["adb", "connect", f"{ip_input}:{port_input}"], check=True, capture_output=True).stdout.decode("utf-8")

time.sleep(4)

console.print("[blue3] Connected To Device Successfully [/blue3]")

print_line(console=console)

console.print(BUN_LOGO, justify="full")

console.print("[blue3] Starting Bun, Running [red]bun run android[/red]")

try:
    os.system("cls && title Hypertrophy")
    subprocess.call(["bun", "run", "android"])
except Exception as e:
    WaitAndExit(f"Could Not Start: {e}")