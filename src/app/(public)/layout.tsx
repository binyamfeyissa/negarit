import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 bg-dot-pattern">
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        {children}
      </div>
      <div className="fixed bottom-4 left-4 text-xs text-muted-foreground">
        © 2026 Negarit. All right reserved.
      </div>
      <div className="fixed bottom-4 right-4 flex space-x-4 text-xs text-muted-foreground">
        <a href="#" className="flex items-center space-x-1 hover:text-primary">
           <span>Privacy</span>
        </a>
        <a href="#" className="flex items-center space-x-1 hover:text-primary">
           <span>Terms</span>
        </a>
        <a href="#" className="flex items-center space-x-1 hover:text-primary">
           <span>Get help</span>
        </a>
      </div>
    </div>
  );
}
