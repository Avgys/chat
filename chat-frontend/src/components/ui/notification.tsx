import React from 'react';

export default function Notification ({ message, type = 'info', onClose }) {
  // Define Tailwind classes based on the notification type
  const baseClasses = 'p-4 rounded-md flex items-center justify-between';
  const typeClasses = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-lg font-bold">
        &times;
      </button>
    </div>
  );
};
