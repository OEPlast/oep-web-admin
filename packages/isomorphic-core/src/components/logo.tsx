import React from 'react';
import Image from 'next/image';

interface LogoProps {
    alwaysFull?: boolean;
    iconOnly?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ alwaysFull = false, iconOnly = false, className = '' }) => {
    // Support both alwaysFull (from storefront) and iconOnly (from admin)
    const showFullOnly = alwaysFull || !iconOnly;

    if (showFullOnly && !iconOnly) {
        return (
            <Image
                src={'/images/brand/logoTransparent.png'}
                alt="Rawura Logo"
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
                src={'/images/brand/logoMiniLight.png'}
                alt="Rawura"
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
                    src={'/images/brand/logoTransparent.png'}
                    alt="Rawura Logo"
                    width={120}
                    height={60}
                    priority
                    className={className || "w-full h-auto"}
                />
            </div>

            {/* Mini logo for mobile screens */}
            <div className="block sm:hidden">
                <Image
                    src={'/images/brand/logoMiniLight.png'}
                    alt="Rawura"
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
