'use client';

import React from 'react';

interface UserAvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'md':
        return 'h-10 w-10 text-sm';
      case 'lg':
        return 'h-12 w-12 text-base';
      case 'xl':
        return 'h-16 w-16 text-xl';
      default:
        return 'h-10 w-10 text-sm';
    }
  };

  const getInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const firstInitial = firstName.charAt(0) || '';
    const lastInitial = lastName.charAt(0) || '';
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || 'U';
  };

  // Use backend proxy endpoint for avatars, matching profile page
  let avatarSrc: string | null = null;
  if (user.photoUrl && typeof user.photoUrl === 'string' && user.photoUrl.trim() !== '') {
    if (user.photoUrl.startsWith('blob:')) {
      avatarSrc = user.photoUrl;
    } else {
      let filename = user.photoUrl;
      if (user.photoUrl.startsWith('http')) {
        // Extract filename from Azure URL
        const parts = user.photoUrl.split('/');
        filename = parts[parts.length - 1] || '';
      }
      avatarSrc = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/user-avatar/${filename}`;
    }
  }

  if (avatarSrc && avatarSrc.trim() !== '') {
    return (
      <div className={`relative ${getSizeClasses()} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt={`${user.firstName || ''} ${user.lastName || ''}`}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses()} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm ${className}`}>
      {getInitials()}
    </div>
  );
};

export default UserAvatar;

