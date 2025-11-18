import React from "react";
import { FaTimes } from "react-icons/fa";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-indigo-300 animate-fadeIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-indigo-700">{title}</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
