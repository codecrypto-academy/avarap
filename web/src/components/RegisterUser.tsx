
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { web3Service } from "@/lib/web3";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function RegisterUser({ onRegistered }: { onRegistered: () => void }) {
    const [role, setRole] = useState("Producer");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            await web3Service.registerUser(role);
            onRegistered();
        } catch (error) {
            console.error("Registration failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle>Register Account</CardTitle>
                <CardDescription>
                    To use the platform, you need to register your account with a role.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="role">Select Role</Label>
                    <div className="relative">
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="Producer">Producer</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Retailer">Retailer</option>
                            <option value="Consumer">Consumer</option>
                        </select>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleRegister} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Registering..." : "Register Now"}
                </Button>
            </CardFooter>
        </Card>
    );
}
