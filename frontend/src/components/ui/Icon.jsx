'use client';

import React from 'react';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Store,
  Wifi,
  Package,
  Layers,
  HelpCircle,
  Info,
  Shield,
  ArrowRight,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Menu,
  Eye,
  EyeOff,
} from 'lucide-react';

const iconMap = {
  search: Search,
  map_pin: MapPin,
  clock: Clock,
  phone: Phone,
  chat: MessageCircle,
  whatsapp: MessageCircle,
  external_link: ExternalLink,
  chevron_down: ChevronDown,
  chevron_right: ChevronRight,
  close: X,
  check: Check,
  alert: AlertCircle,
  refresh: RefreshCw,
  store: Store,
  wifi: Wifi,
  package: Package,
  layers: Layers,
  help: HelpCircle,
  info: Info,
  shield: Shield,
  arrow_right: ArrowRight,
  logout: LogOut,
  plus: Plus,
  edit: Edit,
  delete: Trash2,
  menu: Menu,
  eye: Eye,
  eye_off: EyeOff,
};

export function Icon({ name, size = 20, className = '', label, 'aria-hidden': ariaHidden = true }) {
  const Component = iconMap[name] || HelpCircle;

  return (
    <Component
      size={size}
      className={className}
      aria-hidden={label ? false : ariaHidden}
      aria-label={label}
    />
  );
}

