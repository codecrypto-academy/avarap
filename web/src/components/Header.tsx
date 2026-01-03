"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { CONTRACT_CONFIG } from "@/contracts/config";
import { useEffect, useState } from "react";

export function Header() {
    const { account, disconnect } = useWallet();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = () => {
            if (account && CONTRACT_CONFIG.adminAddress) {
                const isMatch = account.toLowerCase() === CONTRACT_CONFIG.adminAddress.toLowerCase();
                setIsAdmin(isMatch);
            } else {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, [account]);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", visible: true },
        { name: "Tokens", href: "/tokens", visible: !isAdmin },
        { name: "Transfers", href: "/transfers", visible: !isAdmin },
        { name: "Trace", href: "/trace", visible: true },
        { name: "Admin", href: "/admin", visible: isAdmin },
        { name: "Profile", href: "/profile", visible: true },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            Supply Chain Tracker
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navItems.map((item) => {
                            if (!item.visible) return null;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "transition-colors hover:text-foreground/80",
                                        pathname === item.href ? "text-foreground" : "text-foreground/60"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items */}
                    </div>
                    <nav className="flex items-center">
                        {account ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                                <Button variant="outline" size="sm" onClick={disconnect}>
                                    Disconnect
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" asChild>
                                <Link href="/">Connect</Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
