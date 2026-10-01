import "./globals.css";
import "./sections.css";
import "./personal.css";
import "./redesign.css";
import { WorkspaceProvider } from "@/store/WorkspaceContext";

export const metadata = {
  title: "DevFlow — Build. Learn. Flow.",
  description: "A personal workspace for focused software work and steady language learning.",
};

export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><body><WorkspaceProvider>{children}</WorkspaceProvider></body></html>;
}
