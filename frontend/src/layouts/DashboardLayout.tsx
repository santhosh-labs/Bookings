import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* -- Sidebar --------------------------------------------- */}
            <Sidebar />

            {/* -- Main area ------------------------------------------- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

                {/* Topbar */}
                <Topbar />

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-[1400px] mx-auto p-6 md:p-8 pb-16"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default Layout;
