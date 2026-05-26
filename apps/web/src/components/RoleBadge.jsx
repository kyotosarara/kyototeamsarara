import React from 'react';
import { Badge } from '@/components/ui/badge';

const RoleBadge = ({ role, size = 'default' }) => {
  const getRoleConfig = (role) => {
    switch (role) {
      case '三役':
        return {
          label: '三役',
          variant: 'default',
          className: 'bg-primary text-primary-foreground font-medium'
        };
      case 'スタッフ':
        return {
          label: 'スタッフ',
          variant: 'secondary',
          className: 'bg-secondary text-secondary-foreground font-medium'
        };
      case '一般':
        return {
          label: '一般',
          variant: 'outline',
          className: 'bg-muted text-muted-foreground font-medium'
        };
      default:
        return {
          label: role,
          variant: 'outline',
          className: 'font-medium'
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {config.label}
    </Badge>
  );
};

export default RoleBadge;