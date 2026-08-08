import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../types/admin';
import Badge from './ui/Badge';
import { getNakshatraMatches, NakshatraMatchResult } from '../../utils/nakshatraMatcher';

interface NakshatraMatchesProps {
  user: any;
}

export const NakshatraMatches: React.FC<NakshatraMatchesProps> = ({ user }) => {
  const [matches, setMatches] = useState<NakshatraMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Determine the user's nakshatra and pada from their profile details.
    // In many profiles, nakshatra is stored, but let's check what's available.
    // Ensure we handle cases where they might be missing.
    try {
      if (!user.gender || !user.nakshatra) {
        setError('Missing gender or nakshatra details to calculate matches.');
        return;
      }

      // Sometimes Pada is a string or number, sometimes it's undefined. 
      // Passing undefined to our matcher is handled safely, returning [] if it's missing but required by a split star.
      const pada = (user as any).pada || (user as any).nakshatraPada || null;
      
      const results = getNakshatraMatches({
        gender: user.gender,
        nakshatra: user.nakshatra,
        pada: pada,
      });

      if (results.length === 0) {
        setError('No valid matches found, or Nakshatra/Pada details are incomplete.');
      } else {
        setMatches(results);
        setError(null);
      }
    } catch (e) {
      console.error('Error fetching nakshatra matches', e);
      setError('An error occurred while calculating matches.');
    }
  }, [user]);

  if (error) {
    return (
      <div className="p-6 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
        <span className="font-semibold mr-2">Notice:</span>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-900 mb-1">Compatibility Rules</h4>
        <p className="text-xs text-slate-500">
          Showing matching target Nakshatras based on {user.name}'s profile ({user.gender} - {user.rasi ? `${user.rasi} Rasi, ` : ''}{user.nakshatra} Nakshatra).
          Higher scores indicate better compatibility.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-5 py-3">Target Nakshatra</th>
              <th className="px-5 py-3">Compatibility Score</th>
              <th className="px-5 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((match, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-800">
                  {match.targetNakshatra}
                </td>
                <td className="px-5 py-3 text-slate-600 font-mono">
                  {match.score}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${match.isCompatible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${match.isCompatible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {match.isCompatible ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
