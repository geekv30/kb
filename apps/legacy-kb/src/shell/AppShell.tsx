import { Outlet } from 'react-router-dom';
import { ToastProvider } from '../components/ui/Toast';
import { PrototypeBar } from './PrototypeBar';
import { Sidebar } from './Sidebar';

/** Live root `section`: min-width 1024px, flex row, overflow hidden. */
export function AppShell() {
  return (
    <ToastProvider>
      <section className="flex min-w-[1024px] overflow-hidden">
        <Sidebar />
        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <Outlet />
        </main>
      </section>
      <PrototypeBar />
    </ToastProvider>
  );
}
