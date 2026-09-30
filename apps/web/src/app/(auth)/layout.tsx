import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md">
          SEO
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Internal SEO Operations
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Role-Based Control Center & Performance Platform
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
    </div>
  );
}
