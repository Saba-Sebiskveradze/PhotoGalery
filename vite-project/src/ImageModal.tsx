import React from "react";
import "./App.css";

type ImageModalProps = {
  imageUrl: string;
  downloads: number;
  views: number;
  likes: number;
  onClose: () => void;
};

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  downloads,
  views,
  likes,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Full version" className="modal-image" />
        <div className="modal-stats">
          <p>Downloads: {downloads}</p>
          <p>Views: {views}</p>
          <p>Likes: {likes}</p>
        </div>
        <button className="modal-close" onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
};

export default ImageModal;