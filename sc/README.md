# 📦 Smart Contracts (Supply Chain)

Este directorio contiene el código fuente Solidity, tests y configuración para los contratos inteligentes del proyecto.

## 📂 Estructura

- **`src/`**: Código fuente de los contratos (`SupplyChain.sol`).
- **`test/`**: Tests unitarios y de integración (`SupplyChain.t.sol`).
- **`script/`**: Scripts de despliegue Solidity (`Deploy.s.sol`).

## 📚 Documentación

- **[Guía Rápida Docker](QUICKSTART-DOCKER.md)**: Cómo empezar rápidamente usando Docker.
- **[Guía Completa Docker](README-DOCKER.md)**: Documentación detallada del entorno Dockerizado.
- **[Tests](TESTS.md)**: Explicación de la suite de pruebas.

## 🛠️ Comandos Comunes

Si usas los scripts de la carpeta `../scripts`:

```powershell
# Compilar
..\scripts\forge.ps1 build

# Testear
..\scripts\test.ps1

# Desplegar
..\scripts\deploy-docker.ps1
```
