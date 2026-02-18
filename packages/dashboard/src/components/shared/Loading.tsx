export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-sm text-gray-500">{text}</div>
    </div>
  );
}
