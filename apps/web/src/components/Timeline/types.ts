import React from 'react';

export interface Doctrine {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fullContent?: React.ReactNode;
}
