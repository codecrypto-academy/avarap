"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const { account, isConnected } = useWallet();
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            if (account) {
                try {
                    const contract = await web3Service.getContract();
                    if (!contract) {
                        console.error("Contract not found");
                        router.push("/dashboard");
                        return;
                    }

                    const adminAddress = await contract.admin();
                    if (account.toLowerCase() !== adminAddress.toLowerCase()) {
                        console.warn("User is not admin", account, adminAddress);
                        router.push("/dashboard");
                        return;
                    }

                    setIsAdmin(true);
                    await loadUsers();
                } catch (error) {
                    console.error("Admin check failed:", error);
                    // Optionally show error or redirect
                    // setLoading(false); // If we disable loading here, it renders the dashboard logic which might be empty
                }
            } else if (!loading && !account) {
                // Not connected?
            }
        };

        if (isConnected && account) {
            checkAdmin();
        }
    }, [account, isConnected, router]);

    const [transfers, setTransfers] = useState<any[]>([]);

    useEffect(() => {
        const checkAdmin = async () => {
            // ... existing checkAdmin logic ...
        };

        if (isConnected && account) {
            checkAdmin();
        }
    }, [account, isConnected, router]);

    const loadUsers = async () => {
        // setLoading(true); 
        const allUsers = await web3Service.getAllUsers();
        setUsers(allUsers);

        const allTransfers = await web3Service.getAllTransfers();
        setTransfers(allTransfers);

        setLoading(false);
    };

    const pendingCount = users.filter((u: any) => Number(u.status) === 0).length;

    const getStatusLabel = (status: number) => {
        const labels = ["Pending", "Approved", "Rejected", "Canceled"];
        return labels[status] || "Unknown";
    };

    if (!isAdmin && loading) return <div className="p-8 text-center text-muted-foreground">Checking permissions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Users waiting for approval</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8">Loading users...</p>
                    ) : users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users found.</p>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Address</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user: any) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{user.id.toString()}</td>
                                            <td className="p-4 align-middle font-mono">{user.userAddress}</td>
                                            <td className="p-4 align-middle">{user.role}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${Number(user.status) === 1 ? 'bg-green-100 text-green-700' :
                                                    Number(user.status) === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {getStatusLabel(Number(user.status))}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {Number(user.status) === 0 && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            title="Approve"
                                                            onClick={async () => {
                                                                if (confirm("Are you sure you want to approve this user?")) {
                                                                    setLoading(true);
                                                                    try {
                                                                        await web3Service.changeUserStatus(user.userAddress, 1); // 1 = Approved
                                                                        await loadUsers();
                                                                    } catch (e) {
                                                                        alert("Error approving user. Check console for details.");
                                                                    }
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            title="Reject"
                                                            onClick={async () => {
                                                                if (confirm("Are you sure you want to REJECT this user?")) {
                                                                    setLoading(true);
                                                                    try {
                                                                        await web3Service.changeUserStatus(user.userAddress, 2); // 2 = Rejected
                                                                        await loadUsers();
                                                                    } catch (e) {
                                                                        alert("Error rejecting user. Check console for details.");
                                                                    }
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>Network Activity (All Transfers)</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8">Loading transfers...</p>
                    ) : transfers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No transfers recorded.</p>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-center">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">From</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">To</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Token</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amt</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {transfers.map((t: any) => (
                                        <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{t.id.toString()}</td>
                                            <td className="p-4 align-middle font-mono text-xs">{t.from.slice(0, 8)}...</td>
                                            <td className="p-4 align-middle font-mono text-xs">{t.to.slice(0, 8)}...</td>
                                            <td className="p-4 align-middle">{t.tokenId.toString()}</td>
                                            <td className="p-4 align-middle">{t.amount.toString()}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${Number(t.status) === 1 ? 'bg-green-100 text-green-700' :
                                                    Number(t.status) === 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {(() => {
                                                        const labels = ["Pending", "Accepted", "Rejected"];
                                                        return labels[Number(t.status)] || "Unknown";
                                                    })()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
