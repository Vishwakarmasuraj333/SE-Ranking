'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Shield,
  ChevronRight,
  ChevronDown,
  User,
  Info,
  X,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  accountType: 'Owner' | 'Admin' | 'Manager' | 'Viewer';
}

export default function UsersPage() {
  const [users, setUsers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Suraj Vishwakarma',
      email: 'suraj.vishwakarma@gvilab.com',
      accountType: 'Owner',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'Admin' | 'Manager' | 'Viewer'>('Manager');
  const [viewPerPage, setViewPerPage] = useState('10');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugOpen, setIsBugOpen] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const added: TeamMember = {
      id: String(users.length + 1),
      name: newName.trim() || newEmail.split('@')[0],
      email: newEmail.trim(),
      accountType: newAccountType,
    };

    setUsers((prev) => [...prev, added]);
    setNewEmail('');
    setNewName('');
    setIsAddUserOpen(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between font-sans text-gray-900 select-none">
      <div>


        {/* ================= SUB-HEADER BREADCRUMB ROW ================= */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link href="/settings" className="text-gray-500 hover:text-gray-800 transition-colors">
              Settings
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">Users</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-xs text-[#2870ED] hover:underline font-medium cursor-pointer"
            >
              Feedback
            </button>

            {/* User seats badge matching screenshot */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-md text-xs font-medium">
              <User className="w-3.5 h-3.5 text-[#B45309]" />
              <span>User seats {users.length} / 3</span>
              <Info className="w-3 h-3 text-[#B45309] ml-0.5 opacity-80" />
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT WORKSPACE ================= */}
        <main className="max-w-6xl mx-auto px-8 py-6 space-y-5">
          {/* + ADD USER button matching exact screenshot */}
          <div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD USER</span>
            </button>
          </div>

          {/* Search Bar matching screenshot */}
          <div className="max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3.5 pr-8 py-2 bg-white border border-gray-300 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Users Data Table matching Screenshot 3 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="w-12 px-4 py-3.5 text-center"></th>
                  <th className="px-6 py-3.5">NAME</th>
                  <th className="px-6 py-3.5">EMAIL</th>
                  <th className="px-6 py-3.5">ACCOUNT TYPE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Index & Arrow */}
                    <td className="px-4 py-3.5 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500 font-semibold">{idx + 1}</span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      {member.name}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3.5 text-gray-600">
                      {member.email}
                    </td>

                    {/* Account Type with Shield icon for Owner */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        {member.accountType === 'Owner' && (
                          <Shield className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span>{member.accountType}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Control matching Screenshot 3 */}
          <div className="flex items-center justify-end gap-2 text-xs text-gray-500 pt-2">
            <span>View on page:</span>
            <div className="relative">
              <select
                value={viewPerPage}
                onChange={(e) => setViewPerPage(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 pr-7 appearance-none cursor-pointer focus:outline-hidden"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </main>
      </div>

      {/* ================= BOTTOM FOOTER (Screenshot 3) ================= */}
      <footer className="border-t border-gray-200 bg-white px-8 py-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <SeRankingLogo width={90} height={20} />
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setIsBugOpen(true)} className="hover:text-gray-900 transition-colors cursor-pointer">
            Report a bug
          </button>
          <Link href="/affiliate" className="hover:text-gray-900 transition-colors">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:text-gray-900 transition-colors">
            API
          </Link>
          <Link href="/whats-new" className="hover:text-gray-900 transition-colors">
            What&apos;s new
          </Link>
          <Link href="/help" className="hover:text-gray-900 transition-colors">
            Help
          </Link>
        </div>
      </footer>

      {/* ================= ADD USER MODAL ================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add New Team Member</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Suraj Vishwakarma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. colleague@gvilab.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Account Type / Role</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-hidden"
                >
                  <option value="Admin">Admin (Full project configuration)</option>
                  <option value="Manager">Manager (View and edit rankings)</option>
                  <option value="Viewer">Viewer (Read-only reports)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-md cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ReportBugModal isOpen={isBugOpen} onClose={() => setIsBugOpen(false)} />
    </div>
  );
}
