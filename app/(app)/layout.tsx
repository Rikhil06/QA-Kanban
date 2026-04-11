import Sidebar from '@/components/Sidebar';
import { UserProvider } from "@/context/UserContext";
import Header from "@/components/Header";
import AuthGate from "@/components/AuthGate";
import { SidebarProvider } from "@/context/SidebarContext";
import MobileBackdrop from "@/components/MobileBackdrop";
import { ToastContainer } from 'react-toastify';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <UserProvider>
      <AuthGate>
        <SidebarProvider>
          <div className="flex h-screen bg-[#0F0F0F] text-gray-100 overflow-hidden">
            <Sidebar />
            <MobileBackdrop />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <Header />
              <main className="relative overflow-y-auto h-full">
                {children}
              </main>
              <ToastContainer position="bottom-right" pauseOnFocusLoss draggable pauseOnHover />
            </div>
          </div>
        </SidebarProvider>
      </AuthGate>
    </UserProvider>
  );
}
