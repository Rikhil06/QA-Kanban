import { useState } from 'react';
import { Link2, Copy, RotateCw, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface InviteCodeProps {
  code: string;
  onGenerateNew: () => void;
}

export function InviteCode({ code, onGenerateNew }: InviteCodeProps) {
  const [copied, setCopied] = useState(false);
  const [isOneTime, setIsOneTime] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    onGenerateNew();
    // toast.success('New invite code generated');
  };

  return (
    <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="tracking-tight">Invite via Code or Link</h2>
          <p className="text-sm text-white/40 mt-0.5">
            Share a join code for teammates to join instantly.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1.5">Invite Code</p>
              <code className="text-lg tracking-wider text-white/90 font-mono">
                {code ? code : '------- ------- ------- '}
              </code>
            </div>
            {code && (
                <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 text-sm group"
                >
                {copied ? (
                    <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied
                    </>
                ) : (
                    <>
                    <Copy className="w-4 h-4" />
                    Copy
                    </>
                )}
                </button>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Generate New Code
        </button>

        <div className="pt-2 border-t border-white/5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isOneTime}
                onChange={(e) => setIsOneTime(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-white/20 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white/60 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-transform"></div>
            </div>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
              One-time use code
            </span>
          </label>
          
          <p className="text-xs text-white/30 mt-3 leading-relaxed">
            Codes expire after 7 days. One-time codes become invalid after first use.
          </p>
        </div>
      </div>
    </div>
  );
}
