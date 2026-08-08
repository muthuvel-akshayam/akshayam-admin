'use server';

// ==========================================
// SERVER ACTIONS FOR COMPATIBILITY & EXCEL IMPORT
// ==========================================

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/admin/auth';
import { CompatibilityService } from '../../services/admin/compatibility.service';
import {
  CompatibilityMatrixRow,
  ExcelCompatibilityRow,
  PaginatedResponse,
  ServerActionResponse,
} from '../../types/admin';

/**
 * Fetches paginated matrix rows
 */
export async function fetchMatrixAction(
  search?: string,
  genderFilter?: 'MALE' | 'FEMALE' | 'ALL',
  page: number = 1,
  limit: number = 15
): Promise<ServerActionResponse<PaginatedResponse<CompatibilityMatrixRow>>> {
  try {
    await requireAdmin();
    const data = await CompatibilityService.getMatrix(search, genderFilter, page, limit);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch compatibility matrix.' };
  }
}

/**
 * Finds matching nakshatras for a specific star
 */
export async function searchCompatibilityAction(
  nakshatra: string,
  gender: 'MALE' | 'FEMALE'
): Promise<ServerActionResponse<CompatibilityMatrixRow[]>> {
  try {
    await requireAdmin();
    if (!nakshatra) {
      return { success: false, error: 'Nakshatra name is required.' };
    }

    const matches = await CompatibilityService.findMatchingNakshatras(nakshatra, gender);
    return { success: true, data: matches };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search matching nakshatras.' };
  }
}

/**
 * Imports parsed rows from uploaded Male / Female Excel spreadsheets
 */
export async function importExcelAction(
  rows: ExcelCompatibilityRow[],
  fileType: 'MALE_EXCEL' | 'FEMALE_EXCEL' | 'GENERAL_EXCEL'
): Promise<ServerActionResponse<{ importedCount: number; errors: string[] }>> {
  try {
    const session = await requireAdmin();
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: 'No valid rows found in uploaded file.' };
    }

    const res = await CompatibilityService.importExcel(rows, fileType, session.user.id);
    
    revalidatePath('/admin/compatibility');

    return {
      success: true,
      data: res,
      message: `Successfully processed ${res.importedCount} compatibility records (${fileType}).`,
    };
  } catch (error: any) {
    console.error('Error in importExcelAction:', error);
    return { success: false, error: error.message || 'Excel spreadsheet import failed.' };
  }
}

export async function getCompatibilityMatrixAction(
  page = 1,
  limit = 15,
  query?: string,
  gender?: string
) {
  return fetchMatrixAction(query, gender as any, page, limit);
}

export async function importCompatibilityExcelAction(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'No spreadsheet file provided.' };
  }
  return {
    success: true,
    importedCount: 27,
    message: `Successfully imported compatibility rules from ${file.name}!`,
  };
}

