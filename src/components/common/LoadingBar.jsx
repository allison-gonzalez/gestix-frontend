import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import './LoadingBar.css';

export default function LoadingBar() {
  const isLoading = useLoading();
  if (!isLoading) return null;

  return (
    <div className="loading-bar-track">
      <div className="loading-bar-fill" />
    </div>
  );
}
