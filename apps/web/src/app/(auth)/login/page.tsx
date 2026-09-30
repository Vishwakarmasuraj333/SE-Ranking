"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from "@internal-seo/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/projects");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl">Sign in to your account</CardTitle>
        <CardDescription>
          Enter your corporate credentials to access authorized projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4">
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Corporate Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.internal"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <span className="text-slate-400 cursor-not-allowed" title="Contact Super Admin to reset credentials">
              Forgot password?
            </span>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        {/* Development Helper Quick-Fill */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-2">Development Demo Accounts:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@internal-seo.local", "AdminPassword123!")}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-medium transition"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("exec@internal-seo.local", "ExecPassword123!")}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-medium transition"
            >
              SEO Exec
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("viewer@internal-seo.local", "ViewerPassword123!")}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-medium transition"
            >
              Viewer
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
