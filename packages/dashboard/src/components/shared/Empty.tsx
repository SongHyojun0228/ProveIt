export function Empty({ message = 'No data yet' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-4xl mb-2">○</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
