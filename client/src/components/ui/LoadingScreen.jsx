export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Loading EduSphere...
        </p>
      </div>
    </div>
  );
}
