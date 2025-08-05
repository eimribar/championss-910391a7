import React from 'react';

const LOGO_WITH_TEXT_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/eec3d43f8_ChatGPTImageJul26202503_01_58PM.png';
const LOGO_ICON_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8209a1c2d_ChatGPTImageJul26202503_20_02PM.png';

/**
 * Renders the full logo with the name "Championss".
 * @param {{className?: string}} props - Component properties.
 */
export const LogoWithText = ({ className = 'h-8' }) => {
  return (
    <img
      src={LOGO_WITH_TEXT_URL}
      alt="Championss Logo" className="h-36 sm:h-44"

      style={{ filter: 'brightness(1.2) contrast(1.1)' }} />);
};

/**
 * Renders just the standalone crown icon.
 * @param {{className?: string}} props - Component properties.
 */
export const LogoIcon = ({ className = 'w-9 h-9' }) => {
  return (
    <img
      src={LOGO_ICON_URL}
      alt="Championss Icon"
      className={className} />);
};