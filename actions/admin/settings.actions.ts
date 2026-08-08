'use server';

// ==========================================
// SERVER ACTIONS FOR SITE SETTINGS
// ==========================================

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/admin/auth';
import { SettingsService } from '../../services/admin/settings.service';
import { SiteSettingsData, ServerActionResponse } from '../../types/admin';

/**
 * Loads current site configuration
 */
export async function loadSettingsAction(): Promise<ServerActionResponse<SiteSettingsData>> {
  try {
    await requireAdmin();
    const settings = await SettingsService.getSettings();
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load site settings.' };
  }
}

/**
 * Saves updated site settings (marriage age limits, file sizes, maintenance mode)
 */
export async function saveSettingsAction(
  data: Partial<SiteSettingsData>
): Promise<ServerActionResponse<SiteSettingsData>> {
  try {
    const session = await requireAdmin();
    const updated = await SettingsService.updateSettings(data, session.user.id);

    revalidatePath('/admin');
    revalidatePath('/admin/settings');
    revalidatePath('/');

    return {
      success: true,
      data: updated,
      message: 'Site configuration updated successfully.',
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save site settings.' };
  }
}

export const updateSettingsAction = saveSettingsAction;

