"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import prettyBytes from "pretty-bytes";
import { useCallback, useMemo, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import { PiCheckBold, PiTrashBold, PiUploadSimpleBold } from "react-icons/pi";
import { Button, Text, FieldError } from "rizzui";
import cn from "../../utils/class-names";
import UploadIcon from "../../components/shape/upload";
import { endsWith } from "lodash";
import { baseApiClient, handleApiError } from "../../../../../apps/isomorphic/src/libs/axios";
import api from "../../../../../apps/isomorphic/src/libs/endpoints";
import {
  UploadedFile,
  addToUploadHistory,
} from "../../utils/upload-history";
import UploadHistory from "./upload-history";
import { getCdnUrl } from "../../utils/cdn-url";

interface UploadZoneProps {
  label?: string;
  name: string;
  getValues: any;
  setValue: any;
  className?: string;
  error?: string;
  category?: string; // File category for backend (e.g., 'products', 'reviews', 'general')
  multiple?: boolean; // Whether to allow multiple file uploads
  accept?: string; // File types to accept (e.g., 'image/*', 'application/pdf')
}

export interface FileType {
  name: string;
  url: string;
  size: number;
  path?: string;
  mimetype?: string;
  originalName?: string;
  fromHistory?: boolean; // Flag to indicate if file was added from history
}

export default function UploadZone({
  label,
  name,
  className,
  getValues,
  setValue,
  error,
  category = "general",
  multiple = true,
  accept = "image/*",
}: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when form value changes

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      console.log("acceptedFiles", acceptedFiles);
      // Make file selection additive - add to existing files instead of replacing
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Handler for adding files from history
  const handleSelectFromHistory = useCallback(
    (historyFile: UploadedFile) => {
      // Add to uploadedItems directly (already uploaded, don't need to upload again)
      const currentValue = getValues(name);
      const newFile = {
        ...historyFile,
        fromHistory: true,
      };

      

      if (typeof currentValue === "string" || !multiple) {
        setValue(name, newFile.path);
      } else if (Array.isArray(currentValue)) {
        // Check if file already exists
        const exists = currentValue.some((f: any) => f.path === historyFile.path);
        if (!exists) {
          setValue(name, [...currentValue, newFile]);
        } else {
          toast.error("File already added");
          return;
        }
      } else {
        setValue(name, [newFile]);
      }
      
      // Force re-render to show the added file immediately
      setForceUpdate(prev => prev + 1);
    },
    [getValues, setValue, name]
  );

  function handleRemoveFile(index: number) {
    // Make a copy of the files array
    const updatedFiles = [...files];

    // Remove the file at the specified index
    updatedFiles.splice(index, 1);

    // Update the state
    setFiles(updatedFiles);
  }

  // Handle both array and string values
  const initialValue = getValues(name);
  const uploadedItems = useMemo(() => {
    if (isEmpty(initialValue)) return [];

    // Handle case when initialValue is a simple URL string
    if (typeof initialValue === "string") {
      // Extract filename from URL
      const filename = initialValue.split("/").pop() || "image";
      return [
        {
          name: filename,
          url: initialValue,
          size: 0, // We don't know the size for pre-existing URLs
          originalName: filename,
        },
      ];
    }

    // Handle array of file objects (new format with path, url, size, etc.)
    if (Array.isArray(initialValue)) {
      return initialValue.map((file: any) => ({
        name: file.originalName || file.name,
        url: file.url,
        size: file.size || 0,
        path: file.path,
        mimetype: file.mimetype,
        originalName: file.originalName || file.name,
        fromHistory: file.fromHistory || false,
      }));
    }

    // Handle single file object
    return [
      {
        name: initialValue.originalName || initialValue.name,
        url: initialValue.url,
        size: initialValue.size || 0,
        path: initialValue.path,
        mimetype: initialValue.mimetype,
        originalName: initialValue.originalName || initialValue.name,
        fromHistory: initialValue.fromHistory || false,
      },
    ];
  }, [initialValue, forceUpdate]); // Add forceUpdate to dependencies

  const notUploadedItems = files.filter((file) => !uploadedItems?.some((uploadedFile: FileType) => uploadedFile.name === file.name));

  // Custom upload function using axios
  const handleUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();

      if (multiple && filesToUpload.length > 1) {
        // Multiple file upload
        filesToUpload.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("category", category);

        const response = await baseApiClient.post(api.fileUpload.multiple, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        
        if (response.data?.data) {
          const uploadedFiles: UploadedFile[] = response.data.data.map((file: any) => ({
            path: file.path,
            url: getCdnUrl(file.path), 
            size: file.size,
            mimetype: file.mimetype,
            originalName: file.originalName,
            uploadedAt: new Date().toISOString(),
          }));

          // Add to history
          addToUploadHistory(uploadedFiles);

          // Clear selected files
          setFiles([]);
          
          // Update form value
          if (!multiple || typeof initialValue === "string") {
            setValue(name, uploadedFiles[0].path);
          } else {
            setValue(name, uploadedFiles[0].path);
          }

          toast.success(
            <Text as="b" className="font-semibold">
              {uploadedFiles.length} file(s) uploaded successfully
            </Text>
          );
          
          // Force re-render
          setForceUpdate(prev => prev + 1);
        }
      } else {
        // Single file upload
        formData.append("file", filesToUpload[0]);
        formData.append("category", category);

        const response = await baseApiClient.post(api.fileUpload.single, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data?.data) {
          const uploadedFile: UploadedFile = {
            path: response.data.data.path,
            url: getCdnUrl(response.data.data.path), 
            size: response.data.data.size,
            mimetype: response.data.data.mimetype,
            originalName: response.data.data.originalName,
            uploadedAt: new Date().toISOString(),
          };

          // Add to history
          addToUploadHistory(uploadedFile);

          // Clear selected files
          setFiles([]);

          // Update form value
          if (typeof initialValue === "string") {
            setValue(name, uploadedFile);
          } else {
            setValue(name, [uploadedFile]);
          }

          toast.success(
            <Text as="b" className="font-semibold">
              File uploaded successfully
            </Text>
          );
          
          // Force re-render
          setForceUpdate(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || "Failed to upload file(s)");
    } finally {
      setIsUploading(false);
    }
  };

  // Parse accept prop for react-dropzone
  const getAcceptConfig = (): Record<string, string[]> | undefined => {
    if (!accept || accept === '*/*') return undefined;
    
    if (accept === 'image/*') {
      return { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'] };
    }
    
    if (accept === 'video/*') {
      return { 'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi'] };
    }
    
    if (accept === 'audio/*') {
      return { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] };
    }
    
    if (accept === 'application/pdf') {
      return { 'application/pdf': ['.pdf'] };
    }
    
    // For custom MIME types, create proper config
    if (accept.includes('/')) {
      return { [accept]: [] };
    }
    
    return undefined;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: getAcceptConfig(),
    multiple,
  });

  return (
    <div className={cn("grid @container", className)}>
      {label && <span className="mb-1.5 block font-semibold text-gray-900">{label}</span>}
      <div
        className={cn(
          "rounded-md border-[1.8px]",
          !isEmpty(files) && "flex flex-wrap items-center justify-between @xl:flex-nowrap @xl:pr-6"
        )}>
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer items-center gap-4 px-6 py-5 transition-all duration-300",
            isEmpty(files) ? "justify-center" : "flex-grow justify-center @xl:justify-start"
          )}>
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12" />
          <Text className="text-base font-medium">Drop or select file</Text>
        </div>

        {!isEmpty(files) && !isEmpty(notUploadedItems) && (
          <UploadButtons
            files={notUploadedItems}
            isLoading={isUploading}
            onClear={() => setFiles([])}
            onUpload={() => handleUpload(notUploadedItems)}
          />
        )}

        {isEmpty(files) && !isEmpty(notUploadedItems) && (
          <UploadButtons
            files={notUploadedItems}
            isLoading={isUploading}
            onClear={() => setFiles([])}
            onUpload={() => handleUpload(notUploadedItems)}
          />
        )}

        {!isEmpty(files) && isEmpty(notUploadedItems) && (
          <UploadButtons files={files} isLoading={isUploading} onClear={() => setFiles([])} onUpload={() => handleUpload(files)} />
        )}
      </div>

      {(!isEmpty(uploadedItems) || !isEmpty(notUploadedItems)) && (
        <>
          {/* Show uploaded files separately */}

          {/* Show pending uploads (not yet uploaded) separately */}
          {!isEmpty(notUploadedItems) && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
              {notUploadedItems.map((file: any, index: number) => (
                <div key={index} className={cn("relative")}>
                  <figure className="group relative h-40 rounded-md bg-gray-50">
                    <MediaPreview name={file.name} url={file.preview} />
                    {isUploading ? (
                      <div className="absolute inset-0 z-50 grid place-content-center rounded-md bg-gray-800/50">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute right-0 top-0 rounded-full bg-gray-700/70 p-1.5 opacity-20 transition duration-300 hover:bg-red-dark group-hover:opacity-100">
                        <PiTrashBold className="text-white" />
                      </button>
                    )}
                  </figure>
                  <MediaCaption name={file.path} size={file.size} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {error && <FieldError error={error} />}

      {/* Upload History */}
      <UploadHistory className="mt-5" onSelectFromHistory={handleSelectFromHistory} />
    </div>
  );
}

function UploadButtons({
  files,
  onClear,
  onUpload,
  isLoading,
}: {
  files: any[];
  isLoading: boolean;
  onClear: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 px-6 pb-5 @sm:flex-nowrap @xl:w-auto @xl:justify-end @xl:px-0 @xl:pb-0">
      <Button variant="outline" className="w-full gap-2 @xl:w-auto" isLoading={isLoading} onClick={onClear}>
        <PiTrashBold />
        Clear {files.length} files
      </Button>
      <Button className="w-full gap-2 @xl:w-auto" isLoading={isLoading} onClick={onUpload}>
        <PiUploadSimpleBold /> Upload {files.length} files
      </Button>
    </div>
  );
}

function MediaPreview({ name, url }: { name: string; url: string }) {
  // Use blob URLs as-is (for local previews), otherwise construct CDN URL
  const isBlob = url.startsWith('blob:');
  const fullUrl = isBlob ? url : getCdnUrl(url);
  
  // Use regular img for blob URLs, Next Image for CDN URLs
  return isBlob ? (
    <img 
      src={fullUrl} 
      alt={name} 
      className="h-full w-full transform rounded-md object-contain" 
    />
  ) : (
    <Image fill src={fullUrl} alt={name} className="transform rounded-md object-contain" />
  );
}

function MediaCaption({ name, size }: { name: string; size: number }) {
  return (
    <div className="mt-1 text-xs">
      <p className="break-words font-medium text-gray-700">{name}</p>
      <p className="mt-1 font-mono">{prettyBytes(size)}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
          <stop stopColor="#fff" stopOpacity="0" offset="0%" />
          <stop stopColor="#fff" stopOpacity=".631" offset="63.146%" />
          <stop stopColor="#fff" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)">
          <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite" />
          </path>
          <circle fill="#fff" cx="36" cy="18" r="1">
            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </svg>
  );
}
