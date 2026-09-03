'use server';

const API_BASE = process.env.NEXT_PUBLIC_MAIN_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchCarouselItems() {
  try {
    const res = await fetch(`${API_BASE}/api/carousel`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch carousel items');
    return await res.json();
  } catch (error: any) {
    console.error("fetchCarouselItems error:", error);
    return { success: false, error: error.message };
  }
}

export async function createCarouselItem(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/carousel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create carousel item');
    return await res.json();
  } catch (error: any) {
    console.error("createCarouselItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCarouselItem(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/carousel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update carousel item');
    return await res.json();
  } catch (error: any) {
    console.error("updateCarouselItem error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCarouselItem(id: number) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/carousel?id=${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete carousel item');
    return await res.json();
  } catch (error: any) {
    console.error("deleteCarouselItem error:", error);
    return { success: false, error: error.message };
  }
}
