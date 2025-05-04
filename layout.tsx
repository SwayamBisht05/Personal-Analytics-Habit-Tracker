// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Analytics & Habit Tracker',
  description: 'Track your habits and imagine your personal growth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 hidden md:block">
            <div className="p-6 font-semibold text-xl border-b border-gray-700">
              Habit Tracker
            </div>
            <nav className="mt-6 space-y-2 px-6">
              <a href="/" className="block p-2 rounded hover:bg-gray-800">
                Dashboard
              </a>
              <a href="/habits" className="block p-2 rounded hover:bg-gray-800">
                Habits
              </a>
              <a href="/analytics" className="block p-2 rounded hover:bg-gray-800">
                Analytics
              </a>
              <a href="/settings" className="block p-2 rounded hover:bg-gray-800">
                Settings
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
              <h1 className="text-lg font-semibold">Personal Analytics & Habit Tracker</h1>
              <div className="text-sm text-gray-400">Welcome, User</div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-black">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
