'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// REMOVED: PersonaQuestionnaire and analyzeBehavioralProfile imports - separation of concerns
import { BehavioralProfileBadges } from './BehavioralProfileBadges';
import { FileText, Upload } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  description: string;
  behavioral_profile?: string;
}

export function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  // REMOVED: Questionnaire state - separation of concerns

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    behavioral_profile: '',
  });

  useEffect(() => {
    fetchPersonas();
    // REMOVED: fetchQuestions - separation of concerns
  }, []);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      const data = await res.json();
      setPersonas(data);
    } catch {
      toast.error('Failed to fetch personas');
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: fetchQuestions - separation of concerns

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPersona
        ? `/api/personas/${editingPersona.id}`
        : '/api/personas';
      const method = editingPersona ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPersonas();
        setDialogOpen(false);
        setEditingPersona(null);
        setFormData({ name: '', description: '', behavioral_profile: '' });
        toast.success(editingPersona ? 'Persona updated successfully' : 'Persona created successfully');
      } else {
        toast.error('Failed to save persona');
      }
    } catch {
      toast.error('Failed to save persona');
    }
  };

  const handleDelete = async () => {
    if (!personaToDelete) return;

    try {
      const res = await fetch(`/api/personas/${personaToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPersonas();
        toast.success('Persona deleted successfully');
      } else {
        toast.error('Failed to delete persona');
      }
    } catch {
      toast.error('Failed to delete persona');
    } finally {
      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setPersonaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const exportPersonas = () => {
    // HACK: Quick export for validation
    const dataStr = JSON.stringify(personas, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `personas_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const openEditDialog = (persona: Persona) => {
    setEditingPersona(persona);
    setFormData({
      name: persona.name,
      description: persona.description,
      behavioral_profile: persona.behavioral_profile || '',
    });
    setDialogOpen(true);
  };

  // REMOVED: Questionnaire methods - separation of concerns

  if (loading) return <div>Loading...</div>;

  // REMOVED: Questionnaire view - separation of concerns

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Personas</h2>
          <p className="text-sm text-muted-foreground mt-1">{personas.length} personas configured</p>
        </div>
        <div className="flex gap-2">
          {personas.length > 0 && (
            <Button variant="outline" onClick={exportPersonas}>
              <Upload className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          )}
          {/* REMOVED: Create with Questionnaire button - separation of concerns */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPersona(null);
                setFormData({ name: '', description: '', behavioral_profile: '' });
              }}>
                <FileText className="mr-2 h-4 w-4" />
                Manual Create
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPersona ? 'Edit Persona' : 'Create New Persona'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="behavioral_profile">Behavioral Profile (Optional)</Label>
                <Textarea
                  id="behavioral_profile"
                  value={formData.behavioral_profile}
                  onChange={(e) => setFormData({ ...formData, behavioral_profile: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPersona ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {personas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No personas created yet</p>
              <Button variant="outline" onClick={() => {
                setEditingPersona(null);
                setFormData({ name: '', description: '', behavioral_profile: '' });
                setDialogOpen(true);
              }}>
                Create your first persona
              </Button>
            </CardContent>
          </Card>
        ) : (
          personas.map((persona) => (
            <Card key={persona.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${persona.name}`} />
                      <AvatarFallback>{persona.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{persona.name}</CardTitle>
                      </div>
                    <CardDescription className="mb-3">{persona.description}</CardDescription>
                    {persona.behavioral_profile && (
                      <>
                        <BehavioralProfileBadges profile={persona.behavioral_profile} />
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {persona.behavioral_profile}
                        </p>
                      </>
                    )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(persona)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(persona.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the persona
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}