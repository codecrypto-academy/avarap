"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const allUsers = await web3Service.getAllUsers();
        setUsers(allUsers);
        setLoading(false);
    };

    const pendingCount = users.filter((u: any) => Number(u.status) === 0).length;

    const getStatusLabel = (status: number) => {
        const labels = ["Pending", "Approved", "Rejected", "Canceled"];
        return labels[status] || "Unknown";
    };

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
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Approve">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Reject">
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
        </div>
    );
}
