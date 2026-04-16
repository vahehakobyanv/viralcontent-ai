import { Sidebar } from "@/components/layout/sidebar";
import CommandPalette from "@/components/command-palette/command-palette";
import TopBar from "@/components/layout/top-bar";
import MobileInstallPrompt from "@/components/layout/mobile-install-prompt";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <CommandPalette />
      <MobileInstallPrompt />
    </div>
  );
}
