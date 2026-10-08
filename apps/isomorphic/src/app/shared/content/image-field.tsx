'use client';

import { ActionIcon, Text } from 'rizzui';
import { PiTrashBold } from 'react-icons/pi';
import UploadZone from '@core/ui/file-upload/upload-zone';
import cn from '@core/utils/class-names';
import { getCdnUrl } from '@core/utils/cdn-url';

interface ImageFieldProps {
  /** Bare CDN path (what the backend stores), or '' for none. */
  value?: string;
  onChange: (path: string) => void;
  label?: string;
  error?: string;
  className?: string;
  previewClassName?: string;
}

/**
 * One image: a preview with a remove button once set, otherwise the shared UploadZone
 * (POST /files/upload/single). Same pattern as the category image field, but driven by
 * value/onChange so it works inside field arrays.
 */
export default function ImageField({ value, onChange, label, error, className, previewClassName }: ImageFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="block text-sm font-medium text-gray-900">{label}</span>}
      {value ? (
        <div
          className={cn(
            'relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-muted bg-gray-50',
            previewClassName
          )}
        >
          <img src={getCdnUrl(value)} alt="" className="h-full w-full object-contain" />
          <ActionIcon
            size="sm"
            variant="flat"
            color="danger"
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            <PiTrashBold className="h-4 w-4" />
          </ActionIcon>
        </div>
      ) : (
        <UploadZone
          multiple={false}
          name="image"
          category="content"
          // UploadZone reads and writes a form field by name; a string value makes it store the
          // uploaded file's bare path, which is what every content field keeps.
          getValues={() => value ?? ''}
          setValue={(_name: string, next: unknown) => {
            if (typeof next === 'string') onChange(next);
            else if (Array.isArray(next) && next.length) {
              const last = next[next.length - 1] as string | { path?: string } | undefined;
              onChange(typeof last === 'string' ? last : (last?.path ?? ''));
            }
          }}
          className="min-h-[140px] border-dashed"
        />
      )}
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </div>
  );
}
