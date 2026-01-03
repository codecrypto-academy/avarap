# 🛠️ Scripts de Automatización

Este directorio contiene todos los scripts de PowerShell y Docker necesarios para gestionar el ciclo de vida del proyecto Supply Chain Tracker.

## 📋 Lista de Scripts

### Despliegue

- **`deploy-docker.ps1`** (Recomendado)
  - **Uso**: `.\scripts\deploy-docker.ps1`
  - **Qué hace**: Levanta Anvil en Docker, compila el contrato, lo despliega y actualiza automáticamente la configuración del frontend. Todo en uno.

- **`deploy.ps1`**
  - **Uso**: `.\scripts\deploy.ps1`
  - **Qué hace**: Realiza el despliegue usando tu instalación local de Foundry (o los wrappers si tienes Docker) contra un Anvil ya existente.

### Utilidades Docker (Foundry)

Estos scripts permiten usar las herramientas de Foundry sin instalarlas en Windows, vía Docker.

- **`anvil.ps1`**
  - **Uso**: `.\scripts\anvil.ps1`
  - **Qué hace**: Inicia una blockchain local de Ethereum (Anvil) en el puerto 8545.

- **`forge.ps1`**
  - **Uso**: `.\scripts\forge.ps1 [comandos]`
  - **Ejemplos**: `.\scripts\forge.ps1 build`, `.\scripts\forge.ps1 test`
  - **Qué hace**: Ejecuta `forge` dentro del contenedor Docker.

- **`cast.ps1`**
  - **Uso**: `.\scripts\cast.ps1 [comandos]`
  - **Qué hace**: Ejecuta `cast` para interactuar con la cadena desde la línea de comandos.

### Testing

- **`test.ps1`**
  - **Uso**: `.\scripts\test.ps1`
  - **Qué hace**: Ejecuta la suite completa de tests del Smart Contract, limpiando builds previos.

- **`find-contract.ps1`**
  - **Uso**: `.\scripts\find-contract.ps1`
  - **Qué hace**: Utilidad para encontrar la dirección del contrato desplegado si se perdió del log.

## 🚀 Flujo de Trabajo Típico

1. **Iniciar Blockchain**:
   ```powershell
   .\scripts\anvil.ps1
   ```

2. **Desplegar Contrato** (en otra terminal):
   ```powershell
   .\scripts\deploy-docker.ps1
   ```

3. **Ejecutar Tests**:
   ```powershell
   .\scripts\test.ps1
   ```
