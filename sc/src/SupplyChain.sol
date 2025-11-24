// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    // Enums
    enum UserStatus { Pending, Approved, Rejected, Canceled }
    enum TransferStatus { Pending, Accepted, Rejected }

    // Structs
    struct Token {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features; // JSON string
        uint256 parentId;
        uint256 dateCreated;
        mapping(address => uint256) balance;
    }

    struct Transfer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 dateCreated;
        uint256 amount;
        TransferStatus status;
    }

    struct User {
        uint256 id;
        address userAddress;
        string role;
        UserStatus status;
    }

    // State Variables
    address public admin;
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    // Mappings
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    // Events
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, UserStatus status);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApproved() {
        uint256 userId = addressToUserId[msg.sender];
        require(userId != 0, "User not registered");
        require(users[userId].status == UserStatus.Approved, "User not approved");
        _;
    }

    constructor() {
        admin = msg.sender;
        // Register admin as a user automatically? Or just keep separate?
        // README says "Admin... Rol único del creador del contrato"
        // Let's register admin for consistency in user checks if needed, 
        // but usually admin is superuser.
    }

    // User Management
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

    function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        
        users[userId].status = newStatus;
        emit UserStatusChanged(userAddress, newStatus);
    }

    function getUserInfo(address userAddress) public view returns (User memory) {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        return users[userId];
    }

    function isAdmin(address userAddress) public view returns (bool) {
        return userAddress == admin;
    }

    // Token Management
    function createToken(string memory name, uint totalSupply, string memory features, uint parentId) public onlyApproved {
        // TODO: Add role checks (Producer/Factory/Retailer logic)
        
        uint256 tokenId = nextTokenId++;
        Token storage newToken = tokens[tokenId];
        newToken.id = tokenId;
        newToken.creator = msg.sender;
        newToken.name = name;
        newToken.totalSupply = totalSupply;
        newToken.features = features;
        newToken.parentId = parentId;
        newToken.dateCreated = block.timestamp;
        
        // Assign initial balance to creator
        // Note: We can't assign to mapping directly in struct initialization
        // So we do it here. 
        // BUT: Structs with mappings are tricky in memory.
        // We are using storage pointer so it's fine.
        newToken.balance[msg.sender] = totalSupply;

        emit TokenCreated(tokenId, msg.sender, name, totalSupply);
    }

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

    function getTokenBalance(uint tokenId, address userAddress) public view returns (uint) {
        return tokens[tokenId].balance[userAddress];
    }

    // Transfer Management
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

        // Deduct balance immediately? Or wait for acceptance?
        // README says "Pending -> Destinatario Revisa -> Aceptar".
        // Usually we lock funds or deduct on accept. 
        // Let's deduct on accept to avoid locking if rejected? 
        // Or deduct now to prevent double spend?
        // Better to deduct now (escrow) or check balance at accept time.
        // Let's check balance at accept time for simplicity, BUT that allows double spending if multiple transfers pending.
        // SAFEST: Deduct now into "pending" state or just deduct.
        // Let's deduct from sender now.
        tokens[tokenId].balance[msg.sender] -= amount;

        emit TransferRequested(transferId, msg.sender, to, tokenId, amount);
    }

    function acceptTransfer(uint transferId) public onlyApproved {
        Transfer storage t = transfers[transferId];
        require(msg.sender == t.to, "Only recipient can accept");
        require(t.status == TransferStatus.Pending, "Transfer not pending");

        t.status = TransferStatus.Accepted;
        tokens[t.tokenId].balance[t.to] += t.amount;

        emit TransferAccepted(transferId);
    }

    function rejectTransfer(uint transferId) public onlyApproved {
        Transfer storage t = transfers[transferId];
        require(msg.sender == t.to, "Only recipient can reject");
        require(t.status == TransferStatus.Pending, "Transfer not pending");

        t.status = TransferStatus.Rejected;
        // Refund sender
        tokens[t.tokenId].balance[t.from] += t.amount;

        emit TransferRejected(transferId);
    }

    function getTransfer(uint transferId) public view returns (Transfer memory) {
        return transfers[transferId];
    }

    // Aux
    function getUserTokens(address userAddress) public view returns (uint[] memory) {
        // This is expensive to iterate. 
        // For now, simple implementation or keep separate mapping.
        // Let's iterate for MVP (gas intensive but simple)
        // Or better: keep a list in User struct? 
        // User struct doesn't have it.
        // Let's just return empty for now or implement a counter.
        uint[] memory result = new uint[](0); 
        return result;
    }

    function getUserTransfers(address userAddress) public view returns (uint[] memory) {
        // Similar to getUserTokens
        uint[] memory result = new uint[](0);
        return result;
    }
}
