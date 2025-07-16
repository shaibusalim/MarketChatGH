"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("isAuthenticated");
      router.push("/"); // 👈 redirects to landing page
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
