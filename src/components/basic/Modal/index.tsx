import React, { Dispatch, SetStateAction } from "react";
import { Dialog } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  children?: JSX.Element | Array<JSX.Element>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, children, title }) => {
  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full">
          <Dialog.Panel className="w-full max-w-lg p-4 mx-auto bg-white rounded">
            <Dialog.Title className="text-lg font-bold text-center text-bgRadialEnd">{title}</Dialog.Title>
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
