import React from 'react';

export const LogoTextComponent = () => {
  return (
    <div className="flex items-center gap-[10px]">
      <img
        src="/wrecking-social-icon-64.png"
        alt=""
        width={33}
        height={33}
        className="w-[33px] h-[33px]"
      />
      <span className="text-[20px] font-[700] tracking-[-0.01em] whitespace-nowrap">
        Wrecking Social
      </span>
    </div>
  );
};
