export const CONTRACT_CONFIG = {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // First deployment from admin
    adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Anvil Account #0
    abi: [
        // Placeholder ABI - Replace with content from out/SupplyChain.sol/SupplyChain.json
        "function requestUserRole(string memory role) public",
        "function changeStatusUser(address userAddress, uint8 newStatus) public",
        "function getUserInfo(address userAddress) public view returns (tuple(uint256 id, address userAddress, string role, uint8 status))",
        "function isAdmin(address userAddress) public view returns (bool)",
        "function createToken(string memory name, uint totalSupply, string memory features, uint parentId) public",
        "function getToken(uint tokenId) public view returns (uint256 id, address creator, string name, uint256 totalSupply, string features, uint256 parentId, uint256 dateCreated)",
        "function getTokenBalance(uint tokenId, address userAddress) public view returns (uint)",
        "function transfer(address to, uint tokenId, uint amount) public",
        "function acceptTransfer(uint transferId) public",
        "function rejectTransfer(uint transferId) public",
        "function getTransfer(uint transferId) public view returns (uint256 id, address from, address to, uint256 tokenId, uint256 dateCreated, uint256 amount, uint8 status)",
        "function getUserTokens(address userAddress) public view returns (uint[] memory)",
        "function getUserTransfers(address userAddress) public view returns (uint[] memory)",
        "event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply)",
        "event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount)",
        "event TransferAccepted(uint256 indexed transferId)",
        "event TransferRejected(uint256 indexed transferId)",
        "event UserRoleRequested(address indexed user, string role)",
        "event UserStatusChanged(address indexed user, uint8 status)",
        "function nextUserId() public view returns (uint256)",
        "function users(uint256 userId) public view returns (uint256 id, address userAddress, string role, uint8 status)",
        "function nextTokenId() public view returns (uint256)",
        "function nextTransferId() public view returns (uint256)",
        "function admin() public view returns (address)"
    ]
};

export const NETWORK_CONFIG = {
    chainId: 31337,
    chainName: "Anvil Local",
    rpcUrl: "http://localhost:8545",
    currencySymbol: "ETH"
};
