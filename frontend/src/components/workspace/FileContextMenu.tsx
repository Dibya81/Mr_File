import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Download,
  Edit3,
  FolderInput,
  Lock,
  Unlock,
  Users,
  Trash2,
} from 'lucide-react';
import type { Document } from '@/types';
import { cn } from '@/utils/helpers';

interface FileContextMenuProps {
  document: Document;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  action: string;
  danger?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: Eye, label: 'Open', action: 'open' },
  { icon: Download, label: 'Download', action: 'download' },
  { icon: Edit3, label: 'Rename', action: 'rename' },
  { icon: FolderInput, label: 'Move', action: 'move' },
];

const sharingItem: MenuItem = { icon: Users, label: 'Share', action: 'share' };

const lockItem = (isLocked: boolean): MenuItem => ({
  icon: isLocked ? Unlock : Lock,
  label: isLocked ? 'Unlock' : 'Lock',
  action: isLocked ? 'unlock' : 'lock',
});

const deleteItem: MenuItem = { icon: Trash2, label: 'Delete', action: 'delete', danger: true };

export default function FileContextMenu({
  document: doc,
  position,
  onClose,
  onAction,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    if (rect.right > vpW) {
      menuRef.current.style.left = `${position.x - rect.width}px`;
    }
    if (rect.bottom > vpH) {
      menuRef.current.style.top = `${position.y - rect.height}px`;
    }
  }, [position]);

  // Close on backdrop click or Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleItemClick = (action: string) => {
    onAction(action);
    onClose();
  };

  const items = [
    ...menuItems,
    sharingItem,
    lockItem(doc.is_locked),
    { divider: true, key: 'divider-1' },
    deleteItem,
  ];

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />

      {/* Menu */}
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12 }}
        style={{ top: position.y, left: position.x }}
        className={cn(
          'fixed z-50 min-w-[180px] rounded-xl shadow-xl',
          'bg-white dark:bg-[#0B0F19]',
          'border border-gray-200 dark:border-white/10',
          'backdrop-blur-xl',
          'py-1 overflow-hidden'
        )}
      >
        {items.map((item, i) =>
          'divider' in item ? (
            <div key={item.key} className="my-1 border-t border-gray-100 dark:border-white/5" />
          ) : (
            <button
              key={item.action}
              onClick={() => handleItemClick(item.action)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                'hover:bg-gray-50 dark:hover:bg-white/[0.05]',
                item.danger
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                  : 'text-gray-700 dark:text-gray-200'
              )}
            >
              <item.icon size={15} className="shrink-0" />
              {item.label}
            </button>
          )
        )}
      </motion.div>
    </>,
    document.body
  );
}
