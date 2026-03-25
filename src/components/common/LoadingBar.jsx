import React, { useState, useEffect } from 'react';
import { useLoading } from '../../context/LoadingContext';
import './LoadingBar.css';

export default function LoadingBar() {
  const isLoading = useLoading();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setLeaving(false);
      setVisible(true);
    } else if (visible) {
      setLeaving(true);
      const t = setTimeout(() => {
        setVisible(false);
        setLeaving(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className={`loading-bar-track ${leaving ? 'leaving' : ''}`}>
      <div className="loading-bar-fill" />
      <div className="loading-bar-glow" />
    </div>
  );
}
