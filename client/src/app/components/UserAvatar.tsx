'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

interface UserData {
  photoUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md', 
  className = '',
  showName = false 
}) => {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data to get photoUrl
  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
    fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUserData(data);
      })
      .catch(() => {
        // Silently handle error
      });
  }, [user, isLoaded]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!isLoaded) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage 
          src={userData?.photoUrl ? `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/user-avatar/${userData.photoUrl.startsWith('http') ? userData.photoUrl.split('/').pop() : userData.photoUrl}` : undefined} 
          alt={getUserDisplayName()}
          className="object-cover"
        />
        <AvatarFallback className={`${textSizeClasses[size]} font-semibold bg-blue-600 text-white`}>
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium text-gray-700">
          {getUserDisplayName()}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;

