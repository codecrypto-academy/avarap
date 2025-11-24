# Explicación Completa del Código - Supply Chain Tracker

## Índice
1. [Smart Contract (SupplyChain.sol)](#smart-contract)
2. [Frontend - Infraestructura Web3](#frontend-infraestructura)
3. [Frontend - Páginas](#frontend-páginas)
4. [Tests](#tests)

---

## Smart Contract (SupplyChain.sol)

### 1. Estructuras de Datos

#### Enums (Enumeraciones)
```solidity
enum UserStatus { Pending, Approved, Rejected, Canceled }
```
**Explicación**: Define los estados posibles de un usuario:
- `Pending`: Usuario registrado, esperando aprobación del admin
- `Approved`: Usuario aprobado, puede usar el sistema
- `Rejected`: Usuario rechazado por el admin
- `Canceled`: Usuario cancelado

```solidity
enum TransferStatus { Pending, Accepted, Rejected }
```
**Explicación**: Estados de una transferencia:
- `Pending`: Transferencia creada, esperando aceptación del receptor
- `Accepted`: Transferencia aceptada, tokens transferidos
- `Rejected`: Transferencia rechazada, tokens devueltos al emisor

#### Structs (Estructuras)

```solidity
struct Token {
    uint256 id;                          // ID único del token
    address creator;                     // Dirección del creador
    string name;                         // Nombre del token
    uint256 totalSupply;                 // Cantidad total creada
    string features;                     // Metadatos en JSON
    uint256 parentId;                    // ID del token padre (0 si no tiene)
    uint256 dateCreated;                 // Timestamp de creación
    mapping(address => uint256) balance; // Balance por dirección
}
```
**Explicación**: 
- Representa un producto o materia prima en la cadena de suministro
- `parentId` permite rastrear de qué materia prima se hizo un producto
- `balance` es un mapping que guarda cuántos tokens tiene cada dirección

```solidity
struct Transfer {
    uint256 id;              // ID único de la transferencia
    address from;            // Emisor
    address to;              // Receptor
    uint256 tokenId;         // ID del token a transferir
    uint256 dateCreated;     // Timestamp
    uint256 amount;          // Cantidad a transferir
    TransferStatus status;   // Estado de la transferencia
}
```
**Explicación**: Representa una transferencia pendiente de tokens entre usuarios.

```solidity
struct User {
    uint256 id;          // ID único del usuario
    address userAddress; // Dirección Ethereum
    string role;         // Rol: "Producer", "Factory", "Retailer", "Consumer"
    UserStatus status;   // Estado del usuario
}
```
**Explicación**: Almacena información de cada usuario registrado.

### 2. Variables de Estado

```solidity
address public admin;           // Dirección del administrador
uint256 public nextTokenId = 1; // Contador para IDs de tokens
uint256 public nextTransferId = 1;
uint256 public nextUserId = 1;

mapping(uint256 => Token) public tokens;      // ID → Token
mapping(uint256 => Transfer) public transfers; // ID → Transfer
mapping(uint256 => User) public users;        // ID → User
mapping(address => uint256) public addressToUserId; // Dirección → User ID
```
**Explicación**:
- `admin`: Solo esta dirección puede aprobar/rechazar usuarios
- Los contadores aseguran IDs únicos
- Los mappings son como diccionarios: clave → valor

### 3. Modificadores

```solidity
modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can perform this action");
    _;
}
```
**Explicación**: Verifica que quien llama la función sea el admin. El `_` indica dónde se ejecuta el código de la función.

```solidity
modifier onlyApproved() {
    uint256 userId = addressToUserId[msg.sender];
    require(userId != 0, "User not registered");
    require(users[userId].status == UserStatus.Approved, "User not approved");
    _;
}
```
**Explicación**: Verifica que el usuario esté registrado y aprobado antes de permitir la operación.

### 4. Funciones Principales

#### Gestión de Usuarios

```solidity
function requestUserRole(string memory role) public {
    require(addressToUserId[msg.sender] == 0, "User already registered");
    
    uint256 userId = nextUserId++;
    users[userId] = User({
        id: userId,
        userAddress: msg.sender,
        role: role,
        status: UserStatus.Pending
    });
    addressToUserId[msg.sender] = userId;
    
    emit UserRoleRequested(msg.sender, role);
}
```
**Explicación Paso a Paso**:
1. Verifica que el usuario no esté ya registrado
2. Crea un nuevo ID incrementando el contador
3. Crea un nuevo User con estado `Pending`
4. Guarda la relación dirección → userId
5. Emite un evento para que el frontend lo detecte

```solidity
function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
    uint256 userId = addressToUserId[userAddress];
    require(userId != 0, "User not found");
    
    users[userId].status = newStatus;
    emit UserStatusChanged(userAddress, newStatus);
}
```
**Explicación**:
- Solo el admin puede llamar esta función (`onlyAdmin`)
- Cambia el estado de un usuario (aprobar/rechazar)
- Emite evento para notificar el cambio

#### Gestión de Tokens

```solidity
function createToken(string memory name, uint totalSupply, string memory features, uint parentId) public onlyApproved {
    uint256 tokenId = nextTokenId++;
    Token storage newToken = tokens[tokenId];
    newToken.id = tokenId;
    newToken.creator = msg.sender;
    newToken.name = name;
    newToken.totalSupply = totalSupply;
    newToken.features = features;
    newToken.parentId = parentId;
    newToken.dateCreated = block.timestamp;
    
    // Asignar balance inicial al creador
    newToken.balance[msg.sender] = totalSupply;

    emit TokenCreated(tokenId, msg.sender, name, totalSupply);
}
```
**Explicación**:
1. Solo usuarios aprobados pueden crear tokens
2. Crea un nuevo token con ID único
3. `storage` significa que modificamos directamente el storage de blockchain
4. Asigna todo el supply inicial al creador
5. `block.timestamp` es el tiempo actual de la blockchain

```solidity
function getToken(uint tokenId) public view returns (
    uint256 id,
    address creator,
    string memory name,
    uint256 totalSupply,
    string memory features,
    uint256 parentId,
    uint256 dateCreated
) {
    Token storage t = tokens[tokenId];
    return (t.id, t.creator, t.name, t.totalSupply, t.features, t.parentId, t.dateCreated);
}
```
**Explicación**:
- `view` significa que solo lee, no modifica el estado
- No puede retornar el struct completo porque tiene un mapping
- Retorna los campos individuales

#### Gestión de Transferencias

```solidity
function transfer(address to, uint tokenId, uint amount) public onlyApproved {
    require(tokens[tokenId].balance[msg.sender] >= amount, "Insufficient balance");
    require(amount > 0, "Amount must be greater than 0");
    
    uint256 transferId = nextTransferId++;
    transfers[transferId] = Transfer({
        id: transferId,
        from: msg.sender,
        to: to,
        tokenId: tokenId,
        dateCreated: block.timestamp,
        amount: amount,
        status: TransferStatus.Pending
    });

    // Deducir del balance del emisor inmediatamente
    tokens[tokenId].balance[msg.sender] -= amount;

    emit TransferRequested(transferId, msg.sender, to, tokenId, amount);
}
```
**Explicación**:
1. Verifica que el emisor tenga suficiente balance
2. Crea una transferencia en estado `Pending`
3. **Importante**: Deduce los tokens del emisor inmediatamente para evitar doble gasto
4. El receptor debe aceptar la transferencia para recibir los tokens

```solidity
function acceptTransfer(uint transferId) public onlyApproved {
    Transfer storage t = transfers[transferId];
    require(msg.sender == t.to, "Only recipient can accept");
    require(t.status == TransferStatus.Pending, "Transfer not pending");

    t.status = TransferStatus.Accepted;
    tokens[t.tokenId].balance[t.to] += t.amount;

    emit TransferAccepted(transferId);
}
```
**Explicación**:
1. Solo el receptor puede aceptar
2. Solo si está en estado `Pending`
3. Cambia estado a `Accepted`
4. Añade los tokens al balance del receptor

```solidity
function rejectTransfer(uint transferId) public onlyApproved {
    Transfer storage t = transfers[transferId];
    require(msg.sender == t.to, "Only recipient can reject");
    require(t.status == TransferStatus.Pending, "Transfer not pending");

    t.status = TransferStatus.Rejected;
    // Devolver tokens al emisor
    tokens[t.tokenId].balance[t.from] += t.amount;

    emit TransferRejected(transferId);
}
```
**Explicación**:
- Similar a `acceptTransfer` pero devuelve los tokens al emisor

---

## Frontend - Infraestructura Web3

### 1. Web3Context.tsx

```typescript
const Web3Context = createContext<Web3ContextType>({
  account: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  chainId: null,
});
```
**Explicación**: 
- `Context` en React permite compartir datos entre componentes sin pasar props
- Almacena el estado global de la conexión Web3

```typescript
useEffect(() => {
    // Verificar localStorage
    const savedAccount = localStorage.getItem("account");
    if (savedAccount) {
      setAccount(savedAccount);
    }

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("account", accounts[0]);
        } else {
          disconnect();
        }
      });

      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
    }
  }, []);
```
**Explicación**:
1. `useEffect` se ejecuta cuando el componente se monta
2. Intenta recuperar la cuenta guardada en `localStorage` (persistencia)
3. Escucha cambios en MetaMask:
   - Si el usuario cambia de cuenta
   - Si cambia de red
4. `window.ethereum` es la API que MetaMask inyecta en el navegador

```typescript
const connect = async () => {
    try {
      const account = await web3Service.connect();
      setAccount(account);
      localStorage.setItem("account", account);
      
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };
```
**Explicación**:
1. Llama al servicio Web3 para conectar
2. Guarda la cuenta en estado y localStorage
3. Obtiene el Chain ID de la red actual
4. `parseInt(chainId, 16)` convierte de hexadecimal a decimal

### 2. web3.ts (Servicio Web3)

```typescript
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }
```
**Explicación**:
- `BrowserProvider` es la conexión a MetaMask
- `Contract` es la instancia del contrato inteligente
- `Signer` es quien firma las transacciones (el usuario)
- `typeof window !== "undefined"` verifica que estamos en el navegador (no en servidor)

```typescript
async connect(): Promise<string> {
    if (!this.provider) throw new Error("MetaMask not installed");
    
    const accounts = await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      this.signer
    );
    
    return accounts[0];
  }
```
**Explicación**:
1. `eth_requestAccounts` abre el popup de MetaMask
2. `getSigner` obtiene el objeto que puede firmar transacciones
3. Crea la instancia del contrato con:
   - Dirección del contrato desplegado
   - ABI (interfaz del contrato)
   - Signer (para poder enviar transacciones)

### 3. config.ts

```typescript
export const CONTRACT_CONFIG = {
  address: "0x0000000000000000000000000000000000000000", // Reemplazar
  adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  abi: [
    "function requestUserRole(string memory role) public",
    "function getUserInfo(address userAddress) public view returns (...)",
    // ... más funciones
  ]
};
```
**Explicación**:
- `address`: Dirección donde se desplegó el contrato
- `abi`: Array de strings que describe las funciones del contrato
- Ethers.js usa esto para saber cómo llamar al contrato

---

## Frontend - Páginas

### 1. Landing Page (page.tsx)

```typescript
const { isConnected, connect, account } = useWallet();
const [userStatus, setUserStatus] = useState<string | null>(null);
```
**Explicación**:
- `useWallet()` obtiene datos del contexto Web3
- `useState` crea estado local del componente

```typescript
useEffect(() => {
    async function checkUser() {
      if (isConnected && account) {
        setLoading(true);
        const info = await web3Service.getUserInfo(account);
        setUserStatus(info ? info.status : "Unregistered");
        setLoading(false);
      }
    }
    checkUser();
  }, [isConnected, account]);
```
**Explicación**:
1. Se ejecuta cuando `isConnected` o `account` cambian
2. Llama al contrato para obtener info del usuario
3. Actualiza el estado con el status del usuario

```typescript
{!isConnected ? (
  <Button onClick={connect}>
    <Wallet className="mr-2 h-4 w-4" />
    Connect MetaMask
  </Button>
) : (
  // Mostrar estado del usuario
)}
```
**Explicación**: Renderizado condicional - muestra botón de conectar o info del usuario.

### 2. Dashboard (dashboard/page.tsx)

```typescript
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
    <Package className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">0</div>
    <p className="text-xs text-muted-foreground">+0 from last month</p>
  </CardContent>
</Card>
```
**Explicación**: 
- Componentes de Shadcn UI para crear tarjetas
- Actualmente muestra datos estáticos (0)
- En producción, llamaría al contrato para obtener datos reales

### 3. Create Token (tokens/create/page.tsx)

```typescript
<input 
  type="number" 
  className="..." 
  placeholder="100" 
/>
<Button className="w-full">Create Token</Button>
```
**Explicación**:
- Formulario básico para crear tokens
- En producción, al hacer click en el botón:
  1. Obtendría los valores del formulario
  2. Llamaría a `contract.createToken(name, supply, features, parentId)`
  3. Esperaría la confirmación de la transacción
  4. Redireccionaría al usuario

---

## Tests

### 1. Setup

```solidity
function setUp() public {
    admin = address(this);
    producer = address(0x1);
    factory = address(0x2);
    // ...
    
    supplyChain = new SupplyChain();
}
```
**Explicación**:
- `setUp()` se ejecuta antes de cada test
- Crea direcciones de prueba
- Despliega un nuevo contrato para cada test (aislamiento)

### 2. Test Básico

```solidity
function testUserRegistration() public {
    vm.prank(producer);
    supplyChain.requestUserRole("Producer");
    
    SupplyChain.User memory user = supplyChain.getUserInfo(producer);
    assertEq(user.role, "Producer");
    assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending));
}
```
**Explicación**:
1. `vm.prank(producer)`: La siguiente llamada será como si viniera de `producer`
2. Llama a `requestUserRole`
3. Obtiene la info del usuario
4. `assertEq`: Verifica que los valores sean iguales

### 3. Test de Errores

```solidity
function testTransferInsufficientBalance() public {
    // Setup...
    
    vm.prank(producer);
    vm.expectRevert("Insufficient balance");
    supplyChain.transfer(factory, 1, 150);
}
```
**Explicación**:
- `vm.expectRevert("mensaje")`: Espera que la siguiente llamada falle con ese mensaje
- Si no falla, el test falla

### 4. Test de Eventos

```solidity
function testTokenCreatedEvent() public {
    // Setup...
    
    vm.expectEmit(true, true, false, true);
    emit TokenCreated(1, producer, "Material", 100);
    
    vm.prank(producer);
    supplyChain.createToken("Material", 100, "{}", 0);
}
```
**Explicación**:
1. `vm.expectEmit(...)`: Espera que se emita un evento
2. Los booleanos indican qué parámetros indexados verificar
3. `emit TokenCreated(...)`: Define el evento esperado
4. Ejecuta la función que debe emitir el evento

### 5. Test de Flujo Completo

```solidity
function testCompleteSupplyChainFlow() public {
    // 1. Registrar usuarios
    vm.prank(producer);
    supplyChain.requestUserRole("Producer");
    supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    
    // 2. Crear materia prima
    vm.prank(producer);
    supplyChain.createToken("Cotton", 1000, '{"origin":"organic"}', 0);
    
    // 3. Transferir a Factory
    vm.prank(producer);
    supplyChain.transfer(factory, 1, 500);
    
    vm.prank(factory);
    supplyChain.acceptTransfer(1);
    
    // 4. Factory crea producto
    vm.prank(factory);
    supplyChain.createToken("T-Shirt", 100, '{"size":"M"}', 1);
    
    // ... continúa el flujo
    
    // Verificar balances finales
    assertEq(supplyChain.getTokenBalance(1, producer), 500);
    assertEq(supplyChain.getTokenBalance(1, factory), 500);
}
```
**Explicación**:
- Simula un flujo completo de la cadena de suministro
- Verifica que todos los balances sean correctos al final
- Prueba la integración de múltiples funciones

---

## Conceptos Clave

### 1. Blockchain y Smart Contracts
- **Inmutabilidad**: Una vez desplegado, el código no se puede cambiar
- **Transparencia**: Todos pueden ver las transacciones
- **Gas**: Cada operación cuesta gas (ETH)
- **Events**: Forma económica de registrar información

### 2. Solidity
- **Storage vs Memory**: 
  - `storage`: Datos permanentes en blockchain (caro)
  - `memory`: Datos temporales (barato)
- **Mappings**: Como diccionarios, muy eficientes
- **Modifiers**: Reutilización de validaciones

### 3. React y Next.js
- **Components**: Piezas reutilizables de UI
- **Hooks**: `useState`, `useEffect`, `useContext`
- **Server vs Client**: Next.js renderiza en servidor por defecto
  - `"use client"` indica componente del cliente

### 4. Web3
- **Provider**: Conexión a la blockchain
- **Signer**: Quien firma transacciones
- **Contract**: Instancia del smart contract
- **ABI**: Interfaz del contrato

---

## Flujo de Datos Completo

### Ejemplo: Crear un Token

1. **Usuario en Frontend**:
   ```typescript
   // Usuario llena formulario y hace click
   const createToken = async () => {
     const contract = await web3Service.getContract();
     const tx = await contract.createToken(name, supply, features, parentId);
     await tx.wait(); // Espera confirmación
   }
   ```

2. **MetaMask**:
   - Muestra popup pidiendo confirmación
   - Usuario firma la transacción
   - Envía a la blockchain

3. **Blockchain**:
   - Mineros incluyen la transacción en un bloque
   - Se ejecuta `createToken` en el contrato
   - Se emite evento `TokenCreated`

4. **Frontend Detecta Evento**:
   ```typescript
   contract.on("TokenCreated", (tokenId, creator, name, supply) => {
     console.log("Token creado:", tokenId);
     // Actualizar UI
   });
   ```

5. **UI se Actualiza**:
   - Muestra el nuevo token
   - Redirige al dashboard

---

## Seguridad

### En el Smart Contract
- ✅ `onlyAdmin`: Solo admin puede aprobar usuarios
- ✅ `onlyApproved`: Solo usuarios aprobados pueden operar
- ✅ Verificación de balance antes de transferir
- ✅ Verificación de que solo el receptor puede aceptar/rechazar
- ✅ Deducción inmediata para evitar doble gasto

### En el Frontend
- ✅ Verificación de que MetaMask esté instalado
- ✅ Verificación de red correcta (Chain ID)
- ✅ Manejo de errores en transacciones
- ✅ Validación de inputs antes de enviar

---

¿Hay alguna parte específica que quieras que explique con más detalle?
