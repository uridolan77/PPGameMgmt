import React, { useState, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  errorDisplay?: ReactNode;
};

export interface TabsContainerProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
  fullWidth?: boolean;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  defaultTab,
  className = "",
  onChange,
  fullWidth = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || (tabs[0]?.id || ""));

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className={className}>
      <TabsList className={`grid w-full ${fullWidth ? `grid-cols-${Math.min(tabs.length, 6)}` : ''}`}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.errorDisplay || tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};