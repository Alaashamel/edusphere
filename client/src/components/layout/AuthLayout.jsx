import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">EduSphere</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            The Operating System for Every Student
          </p>
        </div>
        <div className="card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
