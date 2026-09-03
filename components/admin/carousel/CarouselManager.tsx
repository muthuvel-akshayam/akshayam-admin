'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';
import { supabaseAdmin } from '../../../lib/admin/supabase';
import { fetchCarouselItems, createCarouselItem, updateCarouselItem, deleteCarouselItem } from '../../../actions/admin/carousel.actions';

interface CarouselItem {
  id: number;
  mediaUrl: string;
  type: 'IMAGE' | 'VIDEO';
  order: number;
  isActive: boolean;
}

export default function CarouselManager() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const json = await fetchCarouselItems();
      if (json.success) {
        setItems(json.data.sort((a: CarouselItem, b: CarouselItem) => a.order - b.order));
      } else {
        showToast(json.error || 'Failed to fetch items', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching carousel items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Determine type
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'VIDEO' : 'IMAGE';

      // 1. Upload to Supabase 'carousel' bucket
      const filePath = `carousel/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabaseAdmin.storage
        .from('carousel')
        .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });

      if (error) {
        throw new Error(error.message);
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('carousel')
        .getPublicUrl(data.path);

      const mediaUrl = publicUrlData.publicUrl;

      // 3. Save to backend API
      const newOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 1;
      
      const payload = {
        mediaUrl,
        type,
        order: newOrder,
        isActive: true
      };

      const saveJson = await createCarouselItem(payload);
      
      if (saveJson.success) {
        showToast('Carousel item added successfully', 'success');
        fetchItems();
      } else {
        throw new Error(saveJson.error || 'Error saving carousel item');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading file', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleActive = async (item: CarouselItem) => {
    try {
      const payload = { ...item, isActive: !item.isActive };
      const json = await updateCarouselItem(payload);
      if (json.success) {
        setItems(items.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
        showToast(`Item ${!item.isActive ? 'activated' : 'deactivated'}`, 'success');
      } else {
        throw new Error(json.error || 'Update failed');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateOrder = async (item: CarouselItem, newOrder: number) => {
    if (newOrder === item.order) return;
    try {
      const payload = { ...item, order: newOrder };
      const json = await updateCarouselItem(payload);
      if (json.success) {
        showToast('Order updated', 'success');
        fetchItems();
      } else {
        throw new Error(json.error || 'Update failed');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsDeleting(true);
    try {
      const json = await deleteCarouselItem(itemToDelete);
      if (json.success) {
        setItems(items.filter(i => i.id !== itemToDelete));
        showToast('Carousel item deleted', 'success');
      } else {
        throw new Error(json.error || 'Delete failed');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Hero Carousel Items</h2>
          <p className="text-xs text-slate-500 mt-1">Manage images and videos shown on the main website hero section.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,video/*" 
            className="hidden" 
          />
          <Button 
            onClick={handleUploadClick} 
            variant="primary" 
            isLoading={isUploading}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          >
            {isUploading ? 'Uploading...' : 'Upload New Media'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Media</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Order</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p>Loading items...</p>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-base">No carousel items found</p>
                  <p className="text-xs mt-1">Upload an image or video to get started.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      {item.type === 'VIDEO' ? (
                        <video src={item.mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                      ) : (
                        <img src={item.mediaUrl} alt={`Carousel ${item.id}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                    {item.type}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <input
                      type="number"
                      defaultValue={item.order}
                      onBlur={(e) => handleUpdateOrder(item, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isActive 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={item.isActive ? "Deactivate" : "Activate"}
                      >
                        {item.isActive ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Carousel Item"
        message="Are you sure you want to delete this item? It will be removed from the main website immediately."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
