'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function MobileBackdrop() {
  const { isOpen, close } = useSidebar();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 lg:hidden"
      onClick={close}
    />
  );
}
