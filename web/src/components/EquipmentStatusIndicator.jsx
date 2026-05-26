import React from 'react';

const EquipmentStatusIndicator = ({ status }) => {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'good':
        return { label: '良好', className: 'bg-[hsl(var(--eq-good))] text-white' };
      case 'needs_repair':
        return { label: '要修理', className: 'bg-[hsl(var(--eq-repair))] text-white' };
      case 'damaged':
        return { label: '破損/紛失', className: 'bg-[hsl(var(--eq-damaged))] text-white' };
      default:
        return { label: '不明', className: 'bg-muted text-muted-foreground' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default EquipmentStatusIndicator;