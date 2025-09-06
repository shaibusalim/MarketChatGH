"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            await signOut({ callbackUrl: "/", redirect: true });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            Logout
        </Button>
    );
}
