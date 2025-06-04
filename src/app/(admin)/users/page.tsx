import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage system users",
};

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Users</h2>
      </div>
      
      {/* Add your users table component here */}
      <div className="mt-6">
        {/* Users list will go here */}
      </div>
    </div>
  );
}
