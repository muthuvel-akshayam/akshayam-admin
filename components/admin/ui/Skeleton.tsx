'use client';

// ==========================================
// SKELETON PRIMITIVE FOR LOADING STATES
// ==========================================

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 ';
  
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4 w-3/4 my-1',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} style={style} />;
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 7,
}) => {
  return (
    <div className="w-full bg-white  rounded-xl border border-slate-200  shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100  flex justify-between items-center">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-32 h-9" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50  border-b border-slate-200 ">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 ">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50 ">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div>
                          <Skeleton className="w-24 h-4 mb-1" />
                          <Skeleton className="w-16 h-3" />
                        </div>
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <div className="flex gap-2">
                        <Skeleton className="w-8 h-8 rounded-md" />
                        <Skeleton className="w-8 h-8 rounded-md" />
                      </div>
                    ) : (
                      <Skeleton className="w-20 h-4" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Skeleton;
