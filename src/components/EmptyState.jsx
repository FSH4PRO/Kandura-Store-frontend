export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-midnight-200 bg-white/50 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="font-serif text-2xl text-midnight-900">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-midnight-400">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
