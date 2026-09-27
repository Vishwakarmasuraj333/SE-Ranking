'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Shield, Mail, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@seranking.com',
      role: 'Owner',
      status: 'Active',
      projects: 'All Projects (Full Access)',
      lastActive: 'Just now',
    },
    {
      id: '2',
      name: 'SEO Manager',
      email: 'seo.manager@workcomposer.com',
      role: 'Manager',
      status: 'Active',
      projects: 'https://www.workcomposer.com/',
      lastActive: '2 hours ago',
    },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setUsers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Invited',
        projects: 'https://www.workcomposer.com/',
        lastActive: 'Pending invite',
      },
    ]);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5 text-[#1B66FF]">
            <Users className="w-6 h-6" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Invite team members, assign granular project permissions, and manage user roles.
          </p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New User</span>
        </button>
      </div>

      {isInviteOpen && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Invite Team Member</h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:border-[#1B66FF]"
              required
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer (Read-only)</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#1B66FF] text-white text-sm font-semibold rounded-lg hover:bg-[#0B59EE] transition-colors cursor-pointer"
              >
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-3 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Assigned Projects</th>
                <th className="px-6 py-3.5">Last Active</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B66FF]/10 text-[#1B66FF] flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-[13px]">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{user.projects}</td>
                  <td className="px-6 py-4 text-gray-500">{user.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
