import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
export function Layout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>);

}