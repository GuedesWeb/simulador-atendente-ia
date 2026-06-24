'use client';

import { useState } from 'react';

export function CopyLinkButton({
  slug,
  baseUrl,
}: {
  slug: string;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${baseUrl}/chat/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50"
      title="Copiar link"
    >
      {copied ? '✓ Copiado!' : '📋 Copiar'}
    </button>
  );
}
