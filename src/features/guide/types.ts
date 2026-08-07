import React from "react";

export type GuideSectionId = 'all' | 'overview' | 'intake' | 'delivery' | 'appointments' | 'tools' | 'archives' | 'admin' | 'tips';

export type NavigatableTab = 'nhap-lieu' | 'tra-the' | 'giay-hen' | 'cong-cu' | 'tang-thu';

export interface ToolGuideItem {
  id: string;
  sectionId: Exclude<GuideSectionId, 'all'>;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  steps: string[];
  tips?: string[];
  keywords: string[];
  targetTab?: NavigatableTab;
}
