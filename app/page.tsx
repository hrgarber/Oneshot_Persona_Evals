'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExperimentRunner } from '@/components/ExperimentRunner';
import { ManageTab } from '@/components/ManageTab';
import { ResultsViewer } from '@/components/ResultsViewer';
import { AnalysisView } from '@/components/AnalysisView';
import { Settings } from '@/components/Settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState('experiment');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Settings />
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Behavioral Analysis Tool</h1>
        <p className="text-gray-600">AI Persona Testing & Analysis System</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiment">Run Experiment</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="history">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="experiment" className="mt-6">
          <ExperimentRunner />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <ManageTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ResultsViewer />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <AnalysisView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
