"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "./use-modal";
import { Modal } from "./modal";

export function ModalViews() {
  const { isOpen, view, closeModal, customSize, size } = useModal();
  const pathname = usePathname();
  useEffect(() => {
    closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      customSize={customSize}
      size={size}
      overlayClassName="bg-opacity-40 backdrop-blur-lg"
      containerClassName="bg-gray-100"
      className="z-[9999] [&_.pointer-events-none]:overflow-visible">
      {view}
    </Modal>
  );
}
