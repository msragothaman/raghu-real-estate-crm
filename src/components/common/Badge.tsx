import React from 'react';
import { PlotStatus, LeadStatus, FollowUpStatus } from '../../types/crm';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
    lg: 'text-sm px-3 py-1.5 font-semibold rounded-xl',
  };

  const variantClasses = {
    default: 'bg-purple-100 text-purple-800 border border-purple-200',
    purple: 'bg-[#F3EFFF] text-[#6C3BFF] border border-[#DDD1FF]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 tracking-wide transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PlotStatusBadge: React.FC<{ status: PlotStatus; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'AVAILABLE':
      return <Badge variant="success" size={size}>AVAILABLE</Badge>;
    case 'HOLD':
      return <Badge variant="warning" size={size}>HOLD</Badge>;
    case 'BOOKED':
      return <Badge variant="info" size={size}>BOOKED</Badge>;
    case 'SOLD':
      return <Badge variant="purple" size={size}>SOLD</Badge>;
    case 'REGISTRATION COMPLETED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
          REGISTERED
        </span>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

export const LeadStatusBadge: React.FC<{ status: LeadStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'NEW':
      return <Badge variant="info" size={size}>NEW</Badge>;
    case 'CONTACTED':
      return <Badge variant="purple" size={size}>CONTACTED</Badge>;
    case 'FOLLOW UP':
      return <Badge variant="warning" size={size}>FOLLOW UP</Badge>;
    case 'SITE VISIT':
      return <Badge variant="default" size={size}>SITE VISIT</Badge>;
    case 'INTERESTED':
      return <Badge variant="purple" size={size}>INTERESTED</Badge>;
    case 'NEGOTIATION':
      return <Badge variant="warning" size={size}>NEGOTIATION</Badge>;
    case 'BOOKED':
      return <Badge variant="success" size={size}>BOOKED</Badge>;
    case 'REGISTRATION COMPLETED':
      return <Badge variant="success" size={size}>REGISTERED</Badge>;
    case 'LOST':
      return <Badge variant="danger" size={size}>LOST</Badge>;
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

export const FollowUpStatusBadge: React.FC<{ status: FollowUpStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'Pending':
      return <Badge variant="warning" size={size}>Pending</Badge>;
    case 'Completed':
      return <Badge variant="success" size={size}>Completed</Badge>;
    case 'Cancelled':
      return <Badge variant="neutral" size={size}>Cancelled</Badge>;
    case 'Missed':
      return <Badge variant="danger" size={size}>Missed</Badge>;
  }
};
