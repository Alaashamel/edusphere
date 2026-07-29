import { useAuth } from "../../../contexts/AuthContext";
import Manage2FA from "../components/Manage2FA";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and security</p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
            <input type="text" defaultValue={user?.firstName} className="input" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
            <input type="text" defaultValue={user?.lastName} className="input" readOnly />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
          <input type="email" defaultValue={user?.email} className="input" readOnly />
        </div>
      </div>

      <Manage2FA />
    </div>
  );
}
