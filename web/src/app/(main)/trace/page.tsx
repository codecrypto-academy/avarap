"use client";

import { useState } from "react";
import { web3Service } from "@/lib/web3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";

export default function TracePage() {
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setError("");
        setData(null);

        try {
            const result = await web3Service.getTokenHistory(Number(searchId));
            if (result) {
                setData(result);
            } else {
                setError("Token not found");
            }
        } catch (err) {
            console.error(err);
            setError("Error searching for token");
        }
        setLoading(false);
    };

    const getStatusBadge = (status: number) => {
        const styles = [
            "bg-yellow-100 text-yellow-800", // Pending
            "bg-green-100 text-green-800",   // Accepted
            "bg-red-100 text-red-800",       // Rejected
        ];
        const labels = ["Pending", "Accepted", "Rejected"];
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || "Unknown"}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Product Traceability</h1>
                <p className="text-muted-foreground">Enter a Product ID to track its journey through the supply chain.</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <Input
                            placeholder="Enter Token ID (e.g. 1)"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            type="number"
                            min="1"
                            className="text-lg"
                        />
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? "Searching..." : (
                                <>
                                    <Search className="mr-2 h-5 w-5" /> Trace
                                </>
                            )}
                        </Button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
                </CardContent>
            </Card>

            {data && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Token Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-6 w-6 text-primary" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Product Name</h3>
                                <p className="text-2xl font-bold">{data.token.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Token ID</h3>
                                <p className="text-2xl font-mono text-primary">#{data.token.id.toString()}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Total Supply</h3>
                                <p className="text-lg">{data.token.totalSupply.toString()} units</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                                <p className="text-sm font-mono break-all">{data.token.creator}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Features / Metadata</h3>
                                <div className="mt-2 p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap">
                                    {data.token.features}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-primary" />
                                Supply Chain Journey
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No transfers recorded yet. Still with creator.</p>
                            ) : (
                                <div className="relative border-l border-muted ml-4 space-y-8 pb-4">
                                    {/* Creator Entry (Virtual) */}
                                    <div className="mb-8 ml-6 relative">
                                        <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                                            <Package className="h-3 w-3 text-primary-foreground" />
                                        </span>
                                        <div className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
                                            <div className="font-semibold text-lg">Minted / Created</div>
                                            <div className="text-sm text-muted-foreground mb-2">
                                                {new Date(Number(data.token.dateCreated) * 1000).toLocaleString()}
                                            </div>
                                            <div className="text-sm">
                                                By: <span className="font-mono text-xs bg-muted px-1 rounded">{data.token.creator}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transfer Events */}
                                    {data.history.map((transfer: any) => (
                                        <div key={transfer.id} className="mb-8 ml-6 relative">
                                            <span className={`absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${Number(transfer.status) === 1 ? "bg-green-500" :
                                                    Number(transfer.status) === 2 ? "bg-red-500" : "bg-yellow-500"
                                                }`}>
                                                {Number(transfer.status) === 1 ? <CheckCircle className="h-3 w-3 text-white" /> :
                                                    Number(transfer.status) === 2 ? <XCircle className="h-3 w-3 text-white" /> :
                                                        <ArrowRight className="h-3 w-3 text-white" />}
                                            </span>

                                            <div className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-semibold text-lg">
                                                        Transfer #{transfer.id.toString()}
                                                    </div>
                                                    {getStatusBadge(Number(transfer.status))}
                                                </div>

                                                <div className="text-sm text-muted-foreground mb-4">
                                                    {new Date(Number(transfer.dateCreated) * 1000).toLocaleString()}
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground">From:</span>
                                                        <div className="font-mono text-xs bg-muted px-2 py-1 rounded truncate">
                                                            {transfer.from}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground">To:</span>
                                                        <div className="font-mono text-xs bg-muted px-2 py-1 rounded truncate">
                                                            {transfer.to}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t text-sm font-medium">
                                                    Amount: {transfer.amount.toString()} units
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
