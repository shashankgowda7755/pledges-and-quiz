'use client';

import { useState } from 'react';

export type Activity = { label: string; path: string; group: string };

// Per-org magic-link generator for the admin panel. Pick any activity
// (pledge, certificate, or quiz) and copy a link that auto-attributes the
// participant to this org via ?org=<slug>.
export default function MagicLinkPicker({
  orgSlug,
  appUrl,
  activities,
}: {
  orgSlug: string;
  appUrl: string;
  activities: Activity[];
}) {
  const [path, setPath] = useState(activities[0]?.path ?? '');
  const [copied, setCopied] = useState(false);

  if (activities.length === 0) {
    return <span className="text-xs text-gray-400">No active activities</span>;
  }

  const url = `${appUrl}${path}?org=${orgSlug}`;
  const groups = Array.from(new Set(activities.map(a => a.group)));

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[230px]">
      <div className="flex items-center gap-2">
        <select
          value={path}
          onChange={e => setPath(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-teal-400 outline-none"
        >
          {groups.map(g => (
            <optgroup key={g} label={g}>
              {activities.filter(a => a.group === g).map(a => (
                <option key={a.path} value={a.path}>{a.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={copy}
          className="shrink-0 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold px-3 py-1.5 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <code className="text-[10px] text-gray-400 font-mono truncate">{path}?org={orgSlug}</code>
    </div>
  );
}
