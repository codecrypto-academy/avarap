"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Need to create Tabs
import { Send, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function TransfersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>

            <div className="flex flex-col space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transfers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">No transfers found.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
