import Sidebar from '@/components/Sidebar';
import { UserProvider } from "@/context/UserContext";
import Header from "@/components/Header";
import AuthGate from "@/components/AuthGate";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <UserProvider>
      <AuthGate>
        <div className="flex h-screen bg-[#0F0F0F] text-gray-100 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="relative overflow-y-auto">
            {children}
            </main>
          </div>
        </div>
    </AuthGate>
    </UserProvider>
  );
}
