// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public supplyChain;
    address public admin;
    address public producer;
    address public factory;
    address public retailer;
    address public consumer;

    // Events to test
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, SupplyChain.UserStatus status);
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);

    function setUp() public {
        admin = address(this);
        producer = address(0x1);
        factory = address(0x2);
        retailer = address(0x3);
        consumer = address(0x4);

        supplyChain = new SupplyChain();
    }

    // ========== USER MANAGEMENT TESTS ==========

    function testUserRegistration() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.role, "Producer");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending));
    }

    function testAdminApproveUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved));
    }

    function testAdminRejectUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected));
    }

    function testUserStatusChanges() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Approve
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved));

        // Cancel
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Canceled));
    }

    function testOnlyApprovedUsersCanOperate() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Try to create token without approval - should fail
        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Raw Material", 100, "{}", 0);
    }

    function testGetUserInfo() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending));
    }

    function testIsAdmin() public {
        assertTrue(supplyChain.isAdmin(admin));
        assertFalse(supplyChain.isAdmin(producer));
    }

    // ========== TOKEN CREATION TESTS ==========

    function testCreateTokenByProducer() public {
        // Register and approve producer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        // Create token
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 100, '{"type":"cotton"}', 0);

        (uint256 id, address creator, string memory name, uint256 totalSupply, , , ) = supplyChain.getToken(1);
        assertEq(id, 1);
        assertEq(creator, producer);
        assertEq(name, "Raw Material");
        assertEq(totalSupply, 100);
    }

    function testCreateTokenByFactory() public {
        // Setup producer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        // Create raw material
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 100, '{"type":"cotton"}', 0);

        // Setup factory
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Factory creates product from raw material
        vm.prank(factory);
        supplyChain.createToken("T-Shirt", 50, '{"size":"M"}', 1);

        (uint256 id, , string memory name, , , uint256 parentId, ) = supplyChain.getToken(2);
        assertEq(id, 2);
        assertEq(name, "T-Shirt");
        assertEq(parentId, 1);
    }

    function testCreateTokenByRetailer() public {
        // Setup and create tokens
        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.createToken("Package", 10, '{"items":5}', 0);

        (uint256 id, address creator, , , , , ) = supplyChain.getToken(1);
        assertEq(id, 1);
        assertEq(creator, retailer);
    }

    function testTokenWithParentId() public {
        // Create parent token
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        vm.prank(producer);
        supplyChain.createToken("Parent", 100, "{}", 0);

        // Create child token
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.prank(factory);
        supplyChain.createToken("Child", 50, "{}", 1);

        (, , , , , uint256 parentId, ) = supplyChain.getToken(2);
        assertEq(parentId, 1);
    }

    function testTokenMetadata() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        string memory metadata = '{"color":"blue","weight":100}';
        vm.prank(producer);
        supplyChain.createToken("Product", 10, metadata, 0);

        (, , , , string memory features, , ) = supplyChain.getToken(1);
        assertEq(features, metadata);
    }

    function testTokenBalance() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Product", 100, "{}", 0);

        uint256 balance = supplyChain.getTokenBalance(1, producer);
        assertEq(balance, 100);
    }

    function testGetToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Test Token", 50, '{"test":true}', 0);

        (uint256 id, address creator, string memory name, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(1);
        
        assertEq(id, 1);
        assertEq(creator, producer);
        assertEq(name, "Test Token");
        assertEq(totalSupply, 50);
        assertEq(features, '{"test":true}');
        assertEq(parentId, 0);
        assertGt(dateCreated, 0);
    }

    function testGetUserTokens() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        uint[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 0); // Currently returns empty array
    }

    // ========== TRANSFER TESTS ==========

    function testTransferFromProducerToFactory() public {
        // Setup users
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Create token
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 100, "{}", 0);

        // Transfer
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        // Check transfer exists
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 50);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Pending));
    }

    function testTransferFromFactoryToRetailer() public {
        // Setup
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        // Create token
        vm.prank(factory);
        supplyChain.createToken("Product", 100, "{}", 0);

        // Transfer
        vm.prank(factory);
        supplyChain.transfer(retailer, 1, 30);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, factory);
        assertEq(t.to, retailer);
    }

    function testTransferFromRetailerToConsumer() public {
        // Setup
        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        // Create token
        vm.prank(retailer);
        supplyChain.createToken("Product", 100, "{}", 0);

        // Transfer
        vm.prank(retailer);
        supplyChain.transfer(consumer, 1, 10);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.to, consumer);
    }

    function testAcceptTransfer() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Create and transfer
        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        // Accept
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Verify balances
        assertEq(supplyChain.getTokenBalance(1, producer), 50);
        assertEq(supplyChain.getTokenBalance(1, factory), 50);

        // Verify transfer status
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Accepted));
    }

    function testRejectTransfer() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Create and transfer
        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        // Reject
        vm.prank(factory);
        supplyChain.rejectTransfer(1);

        // Verify balances (should be refunded)
        assertEq(supplyChain.getTokenBalance(1, producer), 100);
        assertEq(supplyChain.getTokenBalance(1, factory), 0);

        // Verify transfer status
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Rejected));
    }

    function testTransferInsufficientBalance() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);

        // Try to transfer more than balance
        vm.prank(producer);
        vm.expectRevert("Insufficient balance");
        supplyChain.transfer(factory, 1, 150);
    }

    function testGetTransfer() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 25);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.id, 1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 25);
    }

    function testGetUserTransfers() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        uint[] memory transfers = supplyChain.getUserTransfers(producer);
        assertEq(transfers.length, 0); // Currently returns empty array
    }

    // ========== VALIDATION & PERMISSION TESTS ==========

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Token", 100, "{}", 0);
    }

    function testUnapprovedUserCannotTransfer() public {
        // Create approved user with token
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        vm.prank(producer);
        supplyChain.createToken("Token", 100, "{}", 0);

        // Transfer to producer
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        // Factory accepts (but is not approved)
        vm.prank(factory);
        vm.expectRevert("User not registered");
        supplyChain.acceptTransfer(1);
    }

    function testOnlyAdminCanChangeStatus() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Non-admin tries to approve
        vm.prank(factory);
        vm.expectRevert("Only admin can perform this action");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    // ========== EDGE CASES ==========

    function testTransferZeroAmount() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Token", 100, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Amount must be greater than 0");
        supplyChain.transfer(factory, 1, 0);
    }

    // ========== EVENT TESTS ==========

    function testUserRegisteredEvent() public {
        vm.expectEmit(true, false, false, true);
        emit UserRoleRequested(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
    }

    function testUserStatusChangedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectEmit(true, false, false, true);
        emit UserStatusChanged(producer, SupplyChain.UserStatus.Approved);
        
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testTokenCreatedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.expectEmit(true, true, false, true);
        emit TokenCreated(1, producer, "Material", 100);
        
        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);
    }

    function testTransferInitiatedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);

        vm.expectEmit(true, true, true, true);
        emit TransferRequested(1, producer, factory, 1, 50);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);
    }

    function testTransferAcceptedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        vm.expectEmit(true, false, false, false);
        emit TransferAccepted(1);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
    }

    function testTransferRejectedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Material", 100, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        vm.expectEmit(true, false, false, false);
        emit TransferRejected(1);
        
        vm.prank(factory);
        supplyChain.rejectTransfer(1);
    }

    // ========== COMPLETE FLOW TESTS ==========

    function testCompleteSupplyChainFlow() public {
        // 1. Register all users
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        // 2. Producer creates raw material
        vm.prank(producer);
        supplyChain.createToken("Cotton", 1000, '{"origin":"organic"}', 0);

        // 3. Producer transfers to Factory
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // 4. Factory creates product
        vm.prank(factory);
        supplyChain.createToken("T-Shirt", 100, '{"size":"M"}', 1);

        // 5. Factory transfers to Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 50);

        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        // 6. Retailer transfers to Consumer
        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 10);

        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        // Verify final balances
        assertEq(supplyChain.getTokenBalance(1, producer), 500);
        assertEq(supplyChain.getTokenBalance(1, factory), 500);
        assertEq(supplyChain.getTokenBalance(2, factory), 50);
        assertEq(supplyChain.getTokenBalance(2, retailer), 40);
        assertEq(supplyChain.getTokenBalance(2, consumer), 10);
    }

    function testMultipleTokensFlow() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        // Create multiple tokens
        vm.prank(producer);
        supplyChain.createToken("Token1", 100, "{}", 0);

        vm.prank(producer);
        supplyChain.createToken("Token2", 200, "{}", 0);

        vm.prank(producer);
        supplyChain.createToken("Token3", 300, "{}", 0);

        // Verify all exist
        (, , string memory name1, , , , ) = supplyChain.getToken(1);
        (, , string memory name2, , , , ) = supplyChain.getToken(2);
        (, , string memory name3, , , , ) = supplyChain.getToken(3);

        assertEq(name1, "Token1");
        assertEq(name2, "Token2");
        assertEq(name3, "Token3");
    }

    function testTraceabilityFlow() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Create parent token
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 1000, '{"type":"cotton"}', 0);

        // Create child token referencing parent
        vm.prank(factory);
        supplyChain.createToken("Product", 100, '{"made_from":"cotton"}', 1);

        // Verify traceability
        (, , , , , uint256 parentId, ) = supplyChain.getToken(2);
        assertEq(parentId, 1);

        // Can trace back to origin
        (, address rawMaterialCreator, , , , , ) = supplyChain.getToken(1);
        assertEq(rawMaterialCreator, producer);
    }
}
