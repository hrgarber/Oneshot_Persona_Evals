'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonaManager } from './PersonaManager';
import { QuestionnaireManager } from './QuestionnaireManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileQuestion } from 'lucide-react';

export function ManageTab() {
  const [activeSubTab, setActiveSubTab] = useState('personas');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Experiment Components</CardTitle>
          <CardDescription>
            Create and manage personas and questionnaires for your experiments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="personas" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Personas
              </TabsTrigger>
              <TabsTrigger value="questionnaires" className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                Questionnaires
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="personas" className="mt-0">
                <PersonaManager />
              </TabsContent>

              <TabsContent value="questionnaires" className="mt-0">
                <QuestionnaireManager />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}