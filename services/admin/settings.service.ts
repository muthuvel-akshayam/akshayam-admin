// ==========================================
// SETTINGS SERVICE - SITE & SYSTEM CONFIGURATION
// ==========================================

import prisma from '../../lib/admin/db';
import { logAdminAction } from '../../lib/admin/auth';
import { SiteSettingsData } from '../../types/admin';
import { DEFAULT_SITE_SETTINGS } from '../../lib/admin/constants';

export class SettingsService {
  /**
   * Retrieves current site settings from DB or returns defaults
   */
  static async getSettings(): Promise<SiteSettingsData> {
    try {
      const db = prisma as any;
      if (db.siteSettings) {
        const record = await db.siteSettings.findUnique({
          where: { id: 'default_settings' },
        });
        if (record) return record;
      }
    } catch (error) {
      console.warn('DB query failed in getSettings, returning default tokens:', error);
    }

    return DEFAULT_SITE_SETTINGS;
  }

  /**
   * Updates site configuration and records admin audit log
   */
  static async updateSettings(
    data: Partial<SiteSettingsData>,
    adminId: number
  ): Promise<SiteSettingsData> {
    try {
      const db = prisma as any;
      if (db.siteSettings) {
        const updated = await db.siteSettings.upsert({
          where: { id: 'default_settings' },
          update: {
            minMaleAge: data.minMaleAge !== undefined ? Number(data.minMaleAge) : undefined,
            minFemaleAge: data.minFemaleAge !== undefined ? Number(data.minFemaleAge) : undefined,
            maxPhotoSizeMb: data.maxPhotoSizeMb !== undefined ? Number(data.maxPhotoSizeMb) : undefined,
            maxDocSizeMb: data.maxDocSizeMb !== undefined ? Number(data.maxDocSizeMb) : undefined,
            featuredProfilesLimit:
              data.featuredProfilesLimit !== undefined ? Number(data.featuredProfilesLimit) : undefined,
            maintenanceMode: data.maintenanceMode !== undefined ? Boolean(data.maintenanceMode) : undefined,
          },
          create: {
            id: 'default_settings',
            minMaleAge: Number(data.minMaleAge || DEFAULT_SITE_SETTINGS.minMaleAge),
            minFemaleAge: Number(data.minFemaleAge || DEFAULT_SITE_SETTINGS.minFemaleAge),
            maxPhotoSizeMb: Number(data.maxPhotoSizeMb || DEFAULT_SITE_SETTINGS.maxPhotoSizeMb),
            maxDocSizeMb: Number(data.maxDocSizeMb || DEFAULT_SITE_SETTINGS.maxDocSizeMb),
            featuredProfilesLimit: Number(
              data.featuredProfilesLimit || DEFAULT_SITE_SETTINGS.featuredProfilesLimit
            ),
            maintenanceMode: Boolean(data.maintenanceMode ?? DEFAULT_SITE_SETTINGS.maintenanceMode),
          },
        });

        await logAdminAction(adminId, 'UPDATE_SITE_SETTINGS', 'default_settings', data);
        return updated;
      }
    } catch (error) {
      console.warn('DB update failed in updateSettings, returning merged mock:', error);
    }

    const merged = { ...DEFAULT_SITE_SETTINGS, ...data };
    await logAdminAction(adminId, 'SIMULATED_UPDATE_SITE_SETTINGS', 'default_settings', data);
    return merged;
  }
}

export const getSettings = SettingsService.getSettings;
export const updateSettings = SettingsService.updateSettings;

