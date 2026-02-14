import React from 'react';
import Modal from '@/Components/Modal';

export default function AvatarCropper({ src, open, onClose }) {
  return (
    <Modal show={open} onClose={onClose} maxWidth="md">
      <div className="glass-soft">
        <div className="p-4">
          <div className="text-sm text-neutral-300 mb-2">Preview</div>
          <div className="mx-auto w-[320px] h-[320px] rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            {src ? (
              <img src={src} alt="avatar-preview" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={onClose} className="rounded bg-neutral-800 px-3 py-2">Close</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
