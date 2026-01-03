"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";

export default function TokensPage() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { account, isConnected } = useWallet();

    const [role, setRole] = useState("");

    // Transfer State
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);

    const handleTransfer = async () => {
        if (!selectedToken || !recipient || !amount) return;

        setTransferLoading(true);
        try {
            await web3Service.transferToken(recipient, Number(selectedToken.id), Number(amount));
            alert("Transfer requested successfully!");
            setTransferModalOpen(false);
            setAmount("");
            setRecipient("");
            loadTokens(); // Refresh
        } catch (e: any) {
            console.error(e);
            alert("Error transferring: " + (e.reason || e.message));
        }
        setTransferLoading(false);
    };

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (isConnected && account) {
            loadTokens();
            loadRole();
            loadUsers();
        }
    }, [isConnected, account]);

    const loadUsers = async () => {
        const allUsers = await web3Service.getAllUsers();
        // Filter out current user and only show approved users
        setUsers(allUsers.filter((u: any) =>
            u.userAddress.toLowerCase() !== account?.toLowerCase() &&
            Number(u.status) === 1 // Approved
        ));
    };

    const loadRole = async () => {
        if (account) {
            const info = await web3Service.getUserInfo(account);
            if (info) setRole(info.role);
        }
    };

    const loadTokens = async () => {
        setLoading(true);
        if (account) {
            const userTokens = await web3Service.getUserTokens(account);
            setTokens(userTokens);
        }
        setLoading(false);
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-muted-foreground">Please connect your wallet to view your tokens.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Tokens</h1>
                {role === "Producer" && (
                    <Button asChild>
                        <Link href="/tokens/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Token
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Loading tokens...</p>
                        </CardContent>
                    </Card>
                ) : tokens.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">You don't have any tokens yet.</p>
                            <Button variant="outline" asChild>
                                <Link href="/tokens/create">Create your first token</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tokens.map((token: any) => (
                        <Card key={token.id}>
                            <CardHeader>
                                <CardTitle>{token.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium">Balance: {token.userBalance?.toString()} (Total: {token.totalSupply.toString()})</div>
                                <div className="text-xs text-muted-foreground mt-2 font-mono">ID: {token.id.toString()}</div>

                                <Button
                                    className="w-full mt-4"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedToken(token);
                                        setTransferModalOpen(true);
                                    }}
                                >
                                    <Send className="mr-2 h-4 w-4" /> Transfer
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Transfer Modal */}
            {transferModalOpen && selectedToken && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Transfer {selectedToken.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipient Address</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                >
                                    <option value="">Select a user...</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.userAddress}>
                                            {u.role} - {u.userAddress.substring(0, 10)}...
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Amount to transfer"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setTransferModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleTransfer} disabled={transferLoading}>
                                    {transferLoading ? "Sending..." : "Transfer"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
