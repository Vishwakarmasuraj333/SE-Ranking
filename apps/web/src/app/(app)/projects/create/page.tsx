"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../context/AuthContext";
import { api } from "../../../../lib/api";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from "@internal-seo/ui";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, canManageProjects } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    primaryDomain: "",
    protocol: "https://",
    industry: "Enterprise Software",
    countryCode: "US",
    primaryLocation: "United States",
    languageCode: "en",
    timezone: "UTC",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission Guard
  if (!canManageProjects) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="error">
          <div>
            <h4 className="font-bold">Access Denied</h4>
            <p className="mt-1">
              Only Super Administrators have permission to register new website projects. Your current role is{" "}
              <strong>{user?.role}</strong>.
            </p>
            <div className="mt-4">
              <Link href="/projects">
                <Button variant="outline" size="sm">
                  Return to Projects Directory
                </Button>
              </Link>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side domain validation
    const cleanDomain = formData.primaryDomain
      .replace("http://", "")
      .replace("https://", "")
      .trim()
      .replace(/\/$/, "");

    if (!cleanDomain.includes(".") || cleanDomain.includes(" ")) {
      setError("Please enter a valid primary domain (e.g., example.com)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.projects.create({
        ...formData,
        primaryDomain: cleanDomain,
      });

      if (res.data?.id) {
        router.push(`/projects/${res.data.id}`);
      } else {
        router.push("/projects");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project. Please verify that the domain is not already registered.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/projects" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2">
          ← Back to Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register New Website Project</h1>
        <p className="text-sm text-slate-500">
          Set up a company digital property as the workspace boundary for rank tracking, crawling, and SEO tasks
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Master Data</CardTitle>
            <CardDescription>All fields are required to establish tracking baselines and location targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="error">
                <span>{error}</span>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Project Display Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Global Portal"
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Protocol</label>
                <select
                  name="protocol"
                  value={formData.protocol}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="https://">https:// (Recommended)</option>
                  <option value="http://">http://</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Domain"
                name="primaryDomain"
                value={formData.primaryDomain}
                onChange={handleChange}
                placeholder="acme.com"
                helperText="Enter FQDN without protocol or paths (e.g. example.com)"
                required
              />

              <Input
                label="Industry / Category"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. B2B SaaS, E-Commerce"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Country</label>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="IN">India (IN)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="FR">France (FR)</option>
                </select>
              </div>

              <Input
                label="Primary City / Location"
                name="primaryLocation"
                value={formData.primaryLocation}
                onChange={handleChange}
                placeholder="e.g. New York, United States"
              />

              <Input
                label="Language Code"
                name="languageCode"
                value={formData.languageCode}
                onChange={handleChange}
                placeholder="en"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <Input
                label="Timezone (IANA)"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                placeholder="UTC or America/New_York"
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Search Engine</label>
                <select
                  name="defaultSearchEngine"
                  value={formData.defaultSearchEngine}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Device</label>
                <select
                  name="defaultDevice"
                  value={formData.defaultDevice}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Link href="/projects">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              Create & Open Project Workspace
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
