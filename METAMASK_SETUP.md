# Configuración de MetaMask para Supply Chain Tracker

Este documento explica cómo conectar MetaMask a tu red local (Anvil) e importar las cuentas de prueba para cada rol.

## 1. Conectar MetaMask a la Red Local (Anvil)

1.  Abre MetaMask y haz clic en el selector de red (arriba a la izquierda).
2.  Haz clic en **"Agregar red"** o **"Add network"**.
3.  Selecciona **"Agregar una red manualmente"** (al final de la lista).
4.  Ingresa los siguientes datos exactos:

| Campo | Valor |
|-------|-------|
| **Nombre de la red** | `Anvil Local` |
| **Nueva dirección URL de RPC** | `http://localhost:8545` |
| **Identificadorde cadena (Chain ID)** | `31337` |
| **Símbolo de moneda** | `ETH` |
| **URL del explorador de bloques** | (Dejar vacio) |

5.  Haz clic en **Guardar**.

> **Nota:** Si MetaMask te da un error de que el Chain ID no coincide, asegúrate de que tu contenedor de Anvil esté corriendo (`docker ps`).

## 2. Importar Cuentas de Prueba

Para probar los diferentes roles, debes importar las "Private Keys" (Claves Privadas) de las cuentas pre-generadas por Anvil.

### Pasos para importar una cuenta:
1.  En MetaMask, haz clic en el círculo de tu cuenta (arriba a la derecha).
2.  Haz clic en **"Importar cuenta"** o **"Import account"**.
3.  Pega la **Clave Privada** (ver lista abajo) y haz clic en **Importar**.

### Lista de Cuentas y Roles

Hemos asignado roles específicos a estas claves durante el script de "Seed":

| Rol | Dirección Pública | Clave Privada (¡COPIAR ESTO!) |
|-----|-------------------|-------------------------------|
| **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Productor** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Fábrica** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **Minorista** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **Consumidor**| `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

## 3. Verificar en la Aplicación

1.  Asegúrate de tener seleccionada la red **Anvil Local** en MetaMask.
2.  Asegúrate de tener seleccionada una de las cuentas importadas (ej. Productor).
3.  Ve a `http://localhost:3000`.
4.  Si no se conecta automáticamente, haz clic en el botón de conectar walet.
5.  Deberías ver tu dirección y, en el Dashboard, tu rol (ej. "Producer").
