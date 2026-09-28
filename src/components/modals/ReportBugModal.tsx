'use client';

import React, { useState } from 'react';
import { X, Send, Bug, CheckCircle2 } from 'lucide-react';
import { appWrapData } from '@/lib/appWrapData';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
  const [name, setName] = useState(appWrapData.account.first_name || 'Suraj');
  const [email, setEmail] = useState(appWrapData.account.email || 'suraj.vishwakarma@gvilab.com');
  const [url, setUrl] = useState(typeof window !== 'undefined' ? window.location.href : 'https://online.seranking.com');
  const [comments, setComments] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      try {
        let currentName = '';
        let currentEmail = '';
        const storedUser = localStorage.getItem('seranking_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) currentName = parsed.name;
          if (parsed.email) currentEmail = parsed.email;
        }
        if (!currentName) {
          const savedName = localStorage.getItem('user_name');
          if (savedName) currentName = savedName;
        }
        if (!currentEmail) {
          const savedEmail = localStorage.getItem('user_email');
          if (savedEmail) currentEmail = savedEmail;
        }
        if (currentName) setName(currentName);
        if (currentEmail) setEmail(currentEmail);
        if (typeof window !== 'undefined') {
          setUrl(window.location.href);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMsg('Please describe the problem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bug_name: name,
          bug_email: email,
          bug_url: url,
          bug_comments: comments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors?.[0] || 'Failed to send bug report');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setComments('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error sending report.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-gray-900">Report a bug</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Message sent!</h4>
            <p className="text-xs text-gray-500">Thank you for your feedback. Our team has received your report.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Noticed incorrect rankings, system or translation errors? Report them here. Your feedback will help us a lot!
            </p>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Comments</label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe what happened or what looks incorrect..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-600 font-semibold text-[11px] bg-red-50 p-2 rounded border border-red-200">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
