import React from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>
                <img src={imageUrl} alt="Invoice Receipt" className="modal-image" />
            </div>
        </div>
    );
};

export default ImageModal;
