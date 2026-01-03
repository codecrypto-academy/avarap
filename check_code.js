
const rpcUrl = "http://localhost:8545";
const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

async function rpc(method, params) {
    const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1
        })
    });
    return response.json();
}

async function check() {
    try {
        const codeRes = await rpc("eth_getCode", [address, "latest"]);
        console.log(`Code result:`, codeRes);

        const nonceRes = await rpc("eth_getTransactionCount", [deployer, "latest"]);
        console.log(`Deployer Nonce:`, nonceRes);

        const balanceRes = await rpc("eth_getBalance", [deployer, "latest"]);
        console.log(`Deployer Balance:`, balanceRes);

    } catch (error) {
        console.error("Error:", error);
    }
}

check();
