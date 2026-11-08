import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../features/auth/types/auth.types';

type SiteHeaderUserMenuProps = {
  user: User;
  onLogout: () => void;
};

export function SiteHeaderUserMenu({ user, onLogout }: SiteHeaderUserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      const node = rootRef.current;
      if (node && !node.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initials = userInitials(user.fullName);

  return (
    <div className="site-header-user-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="site-header-user-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-header-user-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="site-header-user-name">{user.fullName}</span>
      </button>
      {open ? (
        <div id={menuId} className="site-header-user-dropdown" role="menu">
          <Link
            role="menuitem"
            className="site-header-user-dropdown-item"
            to="/account"
            onClick={() => setOpen(false)}
          >
            Quản trị cá nhân
          </Link>
          <button
            type="button"
            role="menuitem"
            className="site-header-user-dropdown-item site-header-user-dropdown-signout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}

function userInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
