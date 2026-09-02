import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Clock,
  Users,
  Star,
  FolderOpen,
  Plus,
  Settings,
  Shield,
  ChevronLeft,
  Lock,
  Sparkles,
  LogOut,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { foldersApi } from '@/api/folders';
import { authApi } from '@/api/auth';
import { cn } from '@/utils/helpers';
import UserProfileMenu from './UserProfileMenu';

interface WorkspaceSidebarProps {
  currentFolderId?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const navItems = [
  { path: '/dashboard', labelKey: 'workspace.nav.dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/recent', labelKey: 'workspace.nav.recent', icon: Clock },
  { path: '/dashboard/starred', labelKey: 'workspace.nav.starred', icon: Star },
  { path: '/shared-with-me', labelKey: 'workspace.nav.shared', icon: Users },
  { path: '/dashboard/community', labelKey: 'community.nav', icon: Globe },
];

export default function WorkspaceSidebar({ currentFolderId, onClose, isMobile }: WorkspaceSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: foldersData } = useQuery({
    queryKey: ['workspace-folders'],
    queryFn: () => foldersApi.list(),
    staleTime: 30000,
  });

  const createFolderMutation = useMutation({
    mutationFn: foldersApi.create,
    onSuccess: () => {
      setShowNewFolder(false);
      setNewFolderName('');
      queryClient.invalidateQueries({ queryKey: ['workspace-folders'] });
    },
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate({ name: newFolderName.trim() });
    }
  };

  const handleNewFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      setShowNewFolder(false);
      setNewFolderName('');
    }
  };

  const folders = foldersData?.data?.folders || [];

  const sidebarBaseClasses = isDark
    ? 'bg-[#090D16] border-slate-800/80 text-slate-300'
    : 'bg-white border-gray-200 text-gray-600';

  const navItemActiveClasses = isDark
    ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
    : 'bg-primary-50 text-primary-700 border-l-2 border-primary-500';

  const navItemInactiveClasses = isDark
    ? 'hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent text-slate-400'
    : 'hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent text-gray-500';

  const folderActiveClasses = isDark
    ? 'bg-white/[0.06] text-white border-l-2 border-blue-500'
    : 'bg-gray-100 text-gray-900 border-l-2 border-primary-500';

  const folderInactiveClasses = isDark
    ? 'hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent text-slate-400'
    : 'hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent text-gray-500';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full w-64 border-r shrink-0',
        'transition-colors duration-200',
        sidebarBaseClasses
      )}
    >
      <SidebarContent
        currentFolderId={currentFolderId}
        isDark={isDark}
        navItemActiveClasses={navItemActiveClasses}
        navItemInactiveClasses={navItemInactiveClasses}
        folderActiveClasses={folderActiveClasses}
        folderInactiveClasses={folderInactiveClasses}
        showNewFolder={showNewFolder}
        setShowNewFolder={setShowNewFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleCreateFolder={handleCreateFolder}
        handleNewFolderKeyDown={handleNewFolderKeyDown}
        folders={folders}
        createFolderMutation={createFolderMutation}
        user={user}
        logout={logout}
        navigate={navigate}
        t={t}
        location={location}
        onClose={onClose}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />
    </aside>
  );
}

interface SidebarContentProps {
  currentFolderId?: string;
  isDark: boolean;
  navItemActiveClasses: string;
  navItemInactiveClasses: string;
  folderActiveClasses: string;
  folderInactiveClasses: string;
  showNewFolder: boolean;
  setShowNewFolder: (v: boolean) => void;
  newFolderName: string;
  setNewFolderName: (v: string) => void;
  handleCreateFolder: () => void;
  handleNewFolderKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  folders: any[];
  createFolderMutation: any;
  user: any;
  logout: () => void;
  navigate: any;
  t: any;
  location: any;
  onClose?: () => void;
  profileOpen: boolean;
  setProfileOpen: (v: boolean) => void;
}

function SidebarContent({
  currentFolderId,
  isDark,
  navItemActiveClasses,
  navItemInactiveClasses,
  folderActiveClasses,
  folderInactiveClasses,
  showNewFolder,
  setShowNewFolder,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  handleNewFolderKeyDown,
  folders,
  createFolderMutation,
  user,
  logout,
  navigate,
  t,
  location,
  onClose,
  profileOpen,
  setProfileOpen,
}: SidebarContentProps) {
  const iconColor = isDark ? 'text-slate-400' : 'text-gray-400';
  const activeIconColor = isDark ? 'text-white' : 'text-gray-900';
  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const sectionLabelColor = isDark ? 'text-slate-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50';
  const inputBg = isDark ? 'bg-white/[0.05]' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-white/[0.1]' : 'border-gray-200';
  const inputText = isDark ? 'text-white' : 'text-gray-900';
  const inputPlaceholder = isDark ? 'placeholder-slate-500' : 'placeholder-gray-400';

  return (
    <>
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b shrink-0', borderColor)}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Lock size={13} className="text-white" />
        </div>
        <span className={cn('text-base font-semibold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
          DocumentVault
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {navItems.map(({ path, labelKey, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === path
            : location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-r-lg rounded-l-none text-sm font-medium transition-all duration-150',
                isActive ? navItemActiveClasses : navItemInactiveClasses
              )}
            >
              <Icon
                size={16}
                className={isActive ? (isDark ? 'text-blue-400' : 'text-primary-600') : iconColor}
              />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}

        <div className={cn('pt-4 mt-2', borderColor)}>
          <div className={cn('flex items-center justify-between px-3 mb-1.5', sectionLabelColor)}>
            <span className="text-xs font-semibold uppercase tracking-wider">Folders</span>
            <button
              onClick={() => setShowNewFolder(true)}
              className={cn(
                'p-0.5 rounded transition-colors',
                hoverBg,
                iconColor
              )}
              title="New folder"
            >
              <Plus size={14} />
            </button>
          </div>

          {showNewFolder && (
            <div className="px-2 mb-1.5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleNewFolderKeyDown}
                placeholder="Folder name"
                className={cn(
                  'w-full px-2.5 py-1.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1',
                  inputBg, inputBorder, inputText, inputPlaceholder,
                  isDark ? 'focus:border-blue-500/50 focus:ring-blue-500/30' : 'focus:border-primary-500 focus:ring-primary-500/30'
                )}
                autoFocus
              />
              <div className="flex gap-1 mt-1.5">
                <button
                  onClick={handleCreateFolder}
                  disabled={createFolderMutation.isPending}
                  className={cn(
                    'flex-1 py-1 text-xs font-medium rounded-md transition-colors',
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-primary-600 text-white hover:bg-primary-500'
                  )}
                >
                  {createFolderMutation.isPending ? '...' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                  className={cn(
                    'flex-1 py-1 text-xs font-medium rounded-md border transition-colors',
                    inputBorder, hoverBg, iconColor
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isActive = currentFolderId === folder.id;
              return (
                <Link
                  key={folder.id}
                  to={`/dashboard/folder/${folder.id}`}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-r-lg rounded-l-none text-sm transition-all duration-150',
                    isActive ? folderActiveClasses : folderInactiveClasses
                  )}
                >
                  <FolderOpen
                    size={14}
                    className={isActive ? (isDark ? 'text-blue-400' : 'text-primary-600') : iconColor}
                  />
                  <span className="truncate">{folder.name}</span>
                </Link>
              );
            })}
            {folders.length === 0 && !showNewFolder && (
              <p className={cn('px-3 py-2 text-xs', sectionLabelColor)}>
                No folders yet
              </p>
            )}
          </div>
        </div>
      </nav>

      <div className={cn('border-t p-3 space-y-1 shrink-0', borderColor)}>
        <Link
          to="/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-r-lg rounded-l-none text-sm font-medium transition-all duration-150 border-l-2',
            location.pathname === '/settings' ? navItemActiveClasses : navItemInactiveClasses
          )}
        >
          <Settings
            size={16}
            className={location.pathname === '/settings' ? (isDark ? 'text-blue-400' : 'text-primary-600') : iconColor}
          />
          <span>{t('workspace.nav.settings')}</span>
        </Link>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            onClick={onClose}
            className={cn(
              'flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-r-lg rounded-l-none text-sm font-medium transition-all duration-150 border-l-2',
              location.pathname.startsWith('/admin') ? navItemActiveClasses : navItemInactiveClasses
            )}
          >
            <Shield
              size={16}
              className={location.pathname.startsWith('/admin') ? (isDark ? 'text-blue-400' : 'text-primary-600') : iconColor}
            />
            <span>{t('admin.section.main')}</span>
          </Link>
        )}

        <div className={cn('pt-1', borderColor)}>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150',
                hoverBg, 'opacity-90 hover:opacity-100'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0',
                isDark ? 'bg-white/[0.1] text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={cn('font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                  {user?.username}
                </p>
                <p className={cn('text-xs truncate capitalize', isDark ? 'text-slate-500' : 'text-gray-400')}>
                  {user?.role}
                </p>
              </div>
            </button>

            {profileOpen && (
              <UserProfileMenu
                onClose={() => setProfileOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export { navItems };
