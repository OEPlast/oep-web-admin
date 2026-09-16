'use client';

import Link from 'next/link';
import cn from '@core/utils/class-names';

interface IdLinkProps {
  /** Where the record lives. Without it the identifier renders as plain text. */
  href?: string | null;
  children: React.ReactNode;
  className?: string;
  /** Shown on hover — useful when a long id is clipped by the column. */
  title?: string;
}

/**
 * A unique identifier in a table: an order number, a payment reference, a return number, a coupon
 * code. Bold and underlined so it reads as the handle for a record, and it opens that record.
 *
 * Use this for the value that *identifies* the row's subject, not for every id on screen: an id
 * with nowhere to go (a gateway's own refund id, for example) stays plain text.
 */
export default function IdLink({
  href,
  children,
  className,
  title,
}: IdLinkProps) {
  if (!href) {
    return (
      <span className={cn('font-medium', className)} title={title}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={title}
      className={cn(
        'font-semibold hover:text-primary hover:underline',
        className
      )}
    >
      {children}
    </Link>
  );
}
