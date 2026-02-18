'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/overview', label: 'Dashboard', icon: '□' },
  { href: '/projects', label: 'Projects', icon: '▦' },
  { href: '/sessions', label: 'Sessions', icon: '◷' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-brand-700">ProveIt</h1>
        <p className="text-xs text-gray-500">Process Portfolio</p>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors ${
                active
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
