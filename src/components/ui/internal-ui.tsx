'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  let baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none ';

  if (variant === 'outline') {
    baseStyles += 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 ';
  } else if (variant === 'ghost') {
    baseStyles += 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ';
  } else if (variant === 'secondary') {
    baseStyles += 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 ';
  } else {
    baseStyles += 'bg-blue-600 hover:bg-blue-700 text-white ';
  }

  if (size === 'sm') {
    baseStyles += 'px-3 py-1.5 text-xs ';
  } else if (size === 'lg') {
    baseStyles += 'px-5 py-2.5 text-sm ';
  } else if (size === 'icon') {
    baseStyles += 'p-2 ';
  } else {
    baseStyles += 'px-4 py-2 text-xs ';
  }

  return (
    <button className={`${baseStyles} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden ${className}`.trim()}
      {...props}
    />
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'info';
}

export function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
  if (variant === 'success') {
    colorStyles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  } else if (variant === 'warning') {
    colorStyles = 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  } else if (variant === 'danger') {
    colorStyles = 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800';
  } else if (variant === 'info') {
    colorStyles = 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  } else if (variant === 'outline') {
    colorStyles = 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`.trim()}
      {...props}
    />
  );
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'warning';
}

export function Alert({
  className = '',
  variant = 'default',
  children,
  ...props
}: AlertProps) {
  let style = 'bg-slate-50 text-slate-900 border-slate-200';
  if (variant === 'error') {
    style = 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  } else if (variant === 'success') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (variant === 'warning') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border text-xs leading-relaxed ${style} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function Card({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 flex flex-col space-y-1.5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-semibold tracking-tight text-slate-900 dark:text-white ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
