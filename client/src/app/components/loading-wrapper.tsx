import React from 'react';
import { useLoading } from '@/contexts/loading-context';

interface LoadingWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  fallback?: React.ReactNode;
}

export function LoadingWrapper({ 
  children, 
  loading, 
  fallback = (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ) 
}: LoadingWrapperProps) {
  const { isLoading } = useLoading();
  const showLoading = loading ?? isLoading;

  if (showLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface WithLoadingProps {
  Component: React.ComponentType<any>;
  fallback?: React.ReactNode;
}

export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithLoadingWrapper(props: P) {
    return (
      <LoadingWrapper fallback={fallback}>
        <Component {...props} />
      </LoadingWrapper>
    );
  };
} 