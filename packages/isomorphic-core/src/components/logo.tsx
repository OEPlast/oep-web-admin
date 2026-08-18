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

const Logo: React.FC<LogoProps> = ({ alwaysFull = false, iconOnly = false, className = "" }) => {
  // Support both alwaysFull (from storefront) and iconOnly (from admin)
  const showFullOnly = alwaysFull || !iconOnly;

  if (showFullOnly && !iconOnly) {
    return (
      <Image
        src={"/images/brand/logoTransparent.png"}
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
        src={"/images/brand/logoMiniLight.png"}
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
          src={"/images/brand/logoTransparent.png"}
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
          src={"/images/brand/logoMiniLight.png"}
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
