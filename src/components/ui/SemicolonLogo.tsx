import React from 'react';

export const SemicolonLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="83" 
    height="215" 
    viewBox="0 0 83 215" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    style={style}
  >
    <rect x="83" width="84" height="83" transform="rotate(90 83 0)" fill="white"/>
    <path d="M83 106L83 189.654L0 215L0 131.346L83 106Z" fill="white"/>
  </svg>
);
