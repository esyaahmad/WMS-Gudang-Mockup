export default function PreLoader() {
  return (
    <div id="preloader">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 dark:bg-black/60 backdrop-blur-sm">
        <div className="surface-panel px-6 py-4 flex items-center gap-3 text-gray-700 dark:text-gray-200 font-medium">
          <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Loading...
        </div>
      </div>
    </div>
  );
}
