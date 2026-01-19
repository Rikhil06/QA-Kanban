import { Check, X } from 'lucide-react';
import React from 'react';

export function FeatureComparison() {
  const features = [
    {
      category: 'Core Features',
      items: [
        { name: 'Projects', free: '3', starter: '5', team: 'Unlimited', agency: 'Custom' },
        { name: 'Screenshots/month', free: '25', starter: '300', team: 'Unlimited', agency: 'Custom' },
        { name: 'Team members', free: '5', starter: '10', team: 'Unlimited', agency: 'Custom' },
        { name: 'History retention', free: '7 days', starter: '90 days', team: 'Unlimited', agency: 'Custom' }
      ]
    },
    {
      category: 'Advanced',
      items: [
        { name: 'Board permissions', free: false, starter: false, team: true, agency: true },
        { name: 'White labelling', free: false, starter: false, team: false, agency: true },
        { name: 'SSO', free: false, starter: false, team: false, agency: true },
        { name: 'Exports (PDF, Jira)', free: false, starter: false, team: false, agency: true }
      ]
    }
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A1A] overflow-hidden mb-12">
      <div className="p-6 border-b border-white/8">
        <h3 className="text-white">Feature Comparison</h3>
        <p className="text-sm text-white/50 mt-1">See what&apos;s included in each plan</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-6 py-4 text-left text-sm text-white/60">Feature</th>
              <th className="px-6 py-4 text-center text-sm text-white/60">Free</th>
              <th className="px-6 py-4 text-center text-sm text-white/60">Starter</th>
              <th className="px-6 py-4 text-center text-sm text-white/60">Team</th>
              <th className="px-6 py-4 text-center text-sm text-white/60">Agency</th>
            </tr>
          </thead>
          <tbody>
            {features.map((category, catIndex) => (
              <React.Fragment key={catIndex}>
                <tr className="bg-[#1C1C1C]/50">
                  <td colSpan={5} className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((feature, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-[#1C1C1C]/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white/80">{feature.name}</td>
                    {['free', 'starter', 'team', 'agency'].map((plan) => {
                      const value = feature[plan as keyof typeof feature];
                      return (
                        <td key={plan} className="px-6 py-4 text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-white/20 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-white/70">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
