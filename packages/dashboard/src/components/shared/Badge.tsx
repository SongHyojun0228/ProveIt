const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
};

export function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.gray}`}
    >
      {children}
    </span>
  );
}
