import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

const MovieTabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState('now-showing');

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
      <Tabs.List className="flex gap-4 mb-6">
        <Tabs.Trigger
          value="now-showing"
          className={`px-4 py-2 text-lg font-semibold transition-colors duration-200
            ${activeTab === 'now-showing' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-600 hover:text-blue-400'
            }`}
        >
          Now Showing
        </Tabs.Trigger>
        <Tabs.Trigger
          value="coming-soon"
          className={`px-4 py-2 text-lg font-semibold transition-colors duration-200
            ${activeTab === 'coming-soon' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-600 hover:text-blue-400'
            }`}
        >
          Coming Soon
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="now-showing" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {children?.nowShowing}
      </Tabs.Content>
      
      <Tabs.Content value="coming-soon" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {children?.comingSoon}
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default MovieTabs; 