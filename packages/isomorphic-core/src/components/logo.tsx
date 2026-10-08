import React from "react";
import Image from "next/image";

interface LogoProps {
  alwaysFull?: boolean;
  iconOnly?: boolean;
  className?: string;
}

// Env-var fallback (not a hardcoded literal) — this is a shared, lower-level package with no
// access to the consuming app's live Settings fetch, so it can't await the branding endpoint
// the way storefront/admin's own Logo wrappers can.
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Rawura";
// Per-deployment logos (e.g. a CDN URL); default to the files bundled in public/images/brand.
const LOGO_FULL = process.env.NEXT_PUBLIC_LOGO_URL || "/images/brand/logoTransparent.png";
const LOGO_ICON = process.env.NEXT_PUBLIC_LOGO_ICON_URL || "/images/brand/logoMiniLight.png";

const Logo: React.FC<LogoProps> = ({ alwaysFull = false, iconOnly = false, className = "" }) => {
  // Support both alwaysFull (from storefront) and iconOnly (from admin)
  const showFullOnly = alwaysFull || !iconOnly;

  if (showFullOnly && !iconOnly) {
    return (
      <Image
        src={LOGO_FULL}
        alt={`${STORE_NAME} Logo`}
        width={120}
        height={60}
        priority
        className={className || "w-full h-auto"}
      />
    );
  }

  // Icon only mode for admin
  if (iconOnly) {
    return (
      <Image
        src={LOGO_ICON}
        alt={STORE_NAME}
        width={50}
        height={50}
        priority
        className={className || "w-full h-auto"}
      />
    );
  }

  // Responsive mode (default storefront behavior)
  return (
    <>
      {/* Full logo for larger screens */}
      <div className="hidden sm:block">
        <Image
          src={LOGO_FULL}
          alt={`${STORE_NAME} Logo`}
          width={120}
          height={60}
          priority
          className={className || "w-full h-auto"}
        />
      </div>

      {/* Mini logo for mobile screens */}
      <div className="block sm:hidden">
        <Image
          src={LOGO_ICON}
          alt={STORE_NAME}
          width={50}
          height={50}
          priority
          className={className || "w-full h-auto"}
        />
      </div>
    </>
  );
};

export default Logo;
