import React from 'react';
import CarouselManager from '../../../components/admin/carousel/CarouselManager';

export const metadata = {
  title: 'Carousel Management | Akshayam Admin',
};

export default function CarouselPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Carousel Management
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Upload and manage the dynamic hero carousel items (images and videos) displayed on the main website homepage.
        </p>
      </div>
      
      <CarouselManager />
    </div>
  );
}
