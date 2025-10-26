"use client";

import Image from "next/image";
import { useState } from "react";
import { PiCaretDown, PiCaretUp, PiTrashBold, PiUploadSimpleBold } from "react-icons/pi";
import { Button, Text } from "rizzui";
import cn from "../../utils/class-names";
import {
  UploadedFile,
  getUploadHistory,
  removeFromUploadHistory,
  clearUploadHistory,
  formatFileSize,
  getRelativeTime,
} from "../../utils/upload-history";
import toast from "react-hot-toast";
import { getCdnUrl } from "../../utils/cdn-url";

interface UploadHistoryProps {
  className?: string;
  onSelectFromHistory?: (file: UploadedFile) => void;
}

export default function UploadHistory({ className, onSelectFromHistory }: UploadHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<UploadedFile[]>(getUploadHistory());

  const refreshHistory = () => {
    setHistory(getUploadHistory());
  };

  const handleRemove = (path: string) => {
    removeFromUploadHistory(path);
    refreshHistory();
    toast.success("Removed from history");
  };

  const handleClearAll = () => {
    clearUploadHistory();
    refreshHistory();
    toast.success("History cleared");
  };

  const handleSelectFile = (file: UploadedFile) => {
    if (onSelectFromHistory) {
      onSelectFromHistory(file);
      toast.success("File added to upload list");
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-5 rounded-lg border border-gray-200", className)}>
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Text className="font-semibold text-gray-900">Upload History</Text>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="mr-2"
            >
              Clear All
            </Button>
          )}
          {isOpen ? (
            <PiCaretUp className="h-5 w-5 text-gray-600" />
          ) : (
            <PiCaretDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-gray-200 p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {history.map((file, index) => (
              <div key={`${file.path}-${index}`} className="group relative">
                {/* Image/File Preview */}
                <figure className="relative h-32 aspect-square overflow-hidden rounded-lg bg-gray-100">
                  {file.mimetype.startsWith("image/") ? (
                    <Image
                      fill
                      src={getCdnUrl(file.url)}
                      alt={file.originalName}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Text className="text-2xl font-bold text-gray-400">
                        {file.mimetype.split("/")[1]?.toUpperCase() || "FILE"}
                      </Text>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSelectFile(file)}
                      className="rounded-full bg-white/90 p-2 transition-colors hover:bg-green-500 hover:text-white"
                      title="Add to upload list"
                    >
                      <PiUploadSimpleBold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(file.path)}
                      className="rounded-full bg-white/90 p-2 transition-colors hover:bg-red-500 hover:text-white"
                      title="Remove from history"
                    >
                      <PiTrashBold className="h-4 w-4" />
                    </button>
                  </div>
                </figure>

                {/* File Info */}
                <div className="mt-2">
                  <Text
                    className="truncate text-xs font-medium text-gray-700"
                    title={file.originalName}
                  >
                    {file.originalName}
                  </Text>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{getRelativeTime(file.uploadedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
