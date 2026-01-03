// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract SeedSupplyChain is Script {
    // Anvil Default Accounts
    uint256 public constant DEPLOYER_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // Account 0
    uint256 public constant PRODUCER_KEY = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d; // Account 1
    uint256 public constant FACTORY_KEY  = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a; // Account 2
    uint256 public constant RETAILER_KEY = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6; // Account 3
    uint256 public constant CONSUMER_KEY = 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a; // Account 4

    address public producerAddress;
    address public factoryAddress;
    address public retailerAddress;
    address public consumerAddress;

    SupplyChain public supplyChain;

    function run() external {
        // Derive addresses
        producerAddress = vm.addr(PRODUCER_KEY);
        factoryAddress = vm.addr(FACTORY_KEY);
        retailerAddress = vm.addr(RETAILER_KEY);
        consumerAddress = vm.addr(CONSUMER_KEY);

        console.log("Starting Seed Script...");
        
        // 1. Deploy Contract (as Admin)
        vm.startBroadcast(DEPLOYER_KEY);
        supplyChain = new SupplyChain();
        console.log("SupplyChain deployed at:", address(supplyChain));
        vm.stopBroadcast();

        // 2. Register Users
        _registerUser(PRODUCER_KEY, "Producer");
        _registerUser(FACTORY_KEY, "Factory");
        _registerUser(RETAILER_KEY, "Retailer");
        _registerUser(CONSUMER_KEY, "Consumer");

        // 3. Approve Users (Admin action)
        _approveUser(producerAddress);
        _approveUser(factoryAddress);
        _approveUser(retailerAddress);
        _approveUser(consumerAddress);

        // 4. Create Initial Token (Raw Material) by Producer
        vm.startBroadcast(PRODUCER_KEY);
        // features json
        string memory features1 = '{"color": "red", "weight": "10kg", "type": "Raw Material"}';
        supplyChain.createToken("Raw Iron", 100, features1, 0); 
        console.log("Producer created Token 1: Raw Iron");
        vm.stopBroadcast();

        // 5. Transfer Raw Material: Producer -> Factory
        vm.startBroadcast(PRODUCER_KEY);
        supplyChain.transfer(factoryAddress, 1, 50); // Transfer 50 units
        console.log("Producer transferred 50 units of Token 1 to Factory");
        vm.stopBroadcast();

        // 6. Factory accepts transfer
        vm.startBroadcast(FACTORY_KEY);
        // Need to find transfer ID. Since it's the first one, it should be 1.
        // In a real script we might query events, but here we can predict IDs because we are in a clean state.
        supplyChain.acceptTransfer(1);
        console.log("Factory accepted transfer 1");
        vm.stopBroadcast();

        // 7. Factory creates Processed Token (Derived from Raw Iron)
        vm.startBroadcast(FACTORY_KEY);
        string memory features2 = '{"batch": "B-001", "grade": "High", "type": "Processed"}';
        // Parent ID is 1 (Raw Iron). 
        supplyChain.createToken("Steel Beam", 10, features2, 1);
        console.log("Factory created Token 2: Steel Beam (Parent: Raw Iron)");
        vm.stopBroadcast();

        // 8. Transfer Processed Token: Factory -> Retailer
        vm.startBroadcast(FACTORY_KEY);
        supplyChain.transfer(retailerAddress, 2, 5); // Transfer 5 units
        console.log("Factory transferred 5 units of Token 2 to Retailer");
        vm.stopBroadcast();

        // 9. Retailer accepts
        vm.startBroadcast(RETAILER_KEY);
        supplyChain.acceptTransfer(2); // Transfer ID 2
        console.log("Retailer accepted transfer 2");
        vm.stopBroadcast();

        // 10. Transfer to Consumer: Retailer -> Consumer
        vm.startBroadcast(RETAILER_KEY);
        supplyChain.transfer(consumerAddress, 2, 1); // Transfer 1 unit
        console.log("Retailer transferred 1 unit of Token 2 to Consumer");
        vm.stopBroadcast();

        // 11. Consumer accepts
        vm.startBroadcast(CONSUMER_KEY);
        supplyChain.acceptTransfer(3); // Transfer ID 3
        console.log("Consumer accepted transfer 3");
        vm.stopBroadcast();

        console.log("Seeding complete!");
        
        // Log final ownership for verification
        _logBalance(1, producerAddress, "Producer");
        _logBalance(1, factoryAddress, "Factory");
        _logBalance(2, factoryAddress, "Factory");
        _logBalance(2, retailerAddress, "Retailer");
        _logBalance(2, consumerAddress, "Consumer");
    }

    function _registerUser(uint256 privateKey, string memory role) internal {
        vm.startBroadcast(privateKey);
        supplyChain.requestUserRole(role);
        console.log("Registered:", role);
        vm.stopBroadcast();
    }

    function _approveUser(address user) internal {
        vm.startBroadcast(DEPLOYER_KEY);
        supplyChain.changeStatusUser(user, SupplyChain.UserStatus.Approved);
        console.log("Admin approved user:", user);
        vm.stopBroadcast();
    }

    function _logBalance(uint256 tokenId, address user, string memory name) internal view {
        uint256 bal = supplyChain.getTokenBalance(tokenId, user);
        console.log(string.concat(name, " balance of Token ", vm.toString(tokenId), ": ", vm.toString(bal)));
    }
}
