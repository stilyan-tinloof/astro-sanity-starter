import { useEffect, useState } from 'react';

export function DraftModeToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  useEffect(() => {
    // Only show toast when in draft mode but NOT in presentation tool (iframe)
    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      setIsVisible(true);
    }
  }, []);

  const handleDisable = async () => {
    setIsDisabling(true);
    try {
      await fetch('/api/draft-mode/disable', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      setIsDisabling(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-4 font-sans text-sm">
      <div>
        <div className="font-medium">Draft Mode Enabled</div>
        <div className="text-neutral-400 text-xs mt-0.5">Viewing draft content</div>
      </div>
      <button
        onClick={handleDisable}
        disabled={isDisabling}
        className="bg-white text-neutral-900 px-3 py-2 rounded font-medium text-xs hover:bg-neutral-100 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isDisabling ? 'Disabling...' : 'Disable'}
      </button>
    </div>
  );
}
