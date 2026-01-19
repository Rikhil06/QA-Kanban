import { Shield, Lock, XCircle } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: XCircle,
      text: 'Cancel anytime'
    },
    {
      icon: Shield,
      text: 'No hidden fees'
    },
    {
      icon: Lock,
      text: 'Secure payments'
    }
  ];

  return (
    <div className="mt-16 pt-8 border-t border-white/[0.08]">
      <div className="flex items-center justify-center gap-8">
        {badges.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-white/30" />
              <span className="text-sm text-white/40">{badge.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
