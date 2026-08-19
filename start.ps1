Write-Host "Iniciando todos los servicios de FinanceAI..." -ForegroundColor Cyan

# 1. Matar procesos anteriores para evitar colisiones de puertos (Opcional, pero recomendado)
Write-Host "Cerrando procesos antiguos (Python, Java, Node)..." -ForegroundColor Yellow
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 2. Iniciar Data Science
Write-Host "Iniciando Data Science..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd DataScient; .\venv\Scripts\python.exe src\predict.py"

# 3. Iniciar Backend (Spring Boot)
Write-Host "Iniciando Backend (Spring Boot)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend\financeia-backend; .\mvnw spring-boot:run"

# 4. Iniciar Frontend (Astro)
Write-Host "Iniciando Frontend (Astro)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; pnpm dev"

Write-Host "¡Todos los servidores han sido levantados en ventanas separadas!" -ForegroundColor Cyan
