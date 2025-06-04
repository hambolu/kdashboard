"use client";

import { settingsApi, type SettingGroupType } from "@/api/settingsApi";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, PlusIcon, TrashIcon } from "lucide-react";

// Define GroupedSettings type locally
type GroupedSettings = {
  [key in SettingGroupType]?: Record<string, string | number | boolean>;
};

// Utility functions
const formatSettingValue = (key: string, value: string | number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
    return '••••••••';
  }
  
  return String(value);
};

const formatKey = (key: string): string => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const groupTitles = {
  general: {
    title: "General Configuration",
    description: "Configure general platform settings like site name, logo, and timezone.",
  },
  api: {
    title: "API Settings",
    description: "Manage API keys, endpoints, and integration settings.",
  },
  email: {
    title: "Email Configuration",
    description: "Set up SMTP settings, email templates, and notification preferences.",
  },
  payment: {
    title: "Payment Settings",
    description: "Configure payment gateways, transaction fees, and currency settings.",
  },
  driver: {
    title: "Driver Configuration",
    description: "Manage driver-related settings, commission rates, and ride configurations.",
  },
  security: {
    title: "Security Settings",
    description: "Configure platform security settings, permissions, and access controls.",
  }
};

export default function SettingsPage() {
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', group: '' });
  const [addingSetting, setAddingSetting] = useState(false);
  const [editingSetting, setEditingSetting] = useState(false);
  const [editingSettingKey, setEditingSettingKey] = useState('');
  const [editingSettingValue, setEditingSettingValue] = useState('');
  const [editingSettingGroup, setEditingSettingGroup] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const response = await settingsApi.getAllSettings();
      console.log("Loaded settings:", response);
      setGroupedSettings(response as GroupedSettings);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading settings:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load settings",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (key: string) => {
    try {
      await settingsApi.updateSetting(key, newSetting.value);
      await loadSettings(); // Refresh settings after update
      toast({
        title: "Success",
        description: "Setting updated successfully",
        variant: "success",
      });
      setIsModalOpen(false);
      setNewSetting({ key: '', value: '', group: '' });
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSetting = async (key: string, groupKey: string) => {
    try {
      await settingsApi.deleteSetting(key);
      await loadSettings(); // Refresh settings after deletion
      toast({
        title: "Success",
        description: "Setting deleted successfully",
        variant: "success",
      });
    } catch (err) {
      console.error("Error deleting setting:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete setting",
        variant: "destructive",
      });
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.key || !newSetting.value || !newSetting.group) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAddingSetting(true);
    try {
      await settingsApi.createSetting({
        key: newSetting.key,
        value: newSetting.value,
        type: newSetting.group as SettingGroupType
      });
      toast({
        title: "Success",
        description: "Setting added successfully",
      });
      setIsModalOpen(false);
      setNewSetting({ key: '', value: '', group: '' });
      loadSettings();
    } catch (_) {
      toast({
        title: "Error",
        description: "Failed to add setting",
        variant: "destructive",
      });
    }
    setAddingSetting(false);
  };

  const handleUpdateSetting = async (key: string, value: string, groupKey: string) => {
    try {
      await settingsApi.updateSetting(key, value);
      await loadSettings(); // Refresh settings after update
      toast({
        title: "Success",
        description: "Setting updated successfully",
        variant: "success",
      });
    } catch (err) {
      console.error("Error updating setting:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const handleEditSetting = async () => {
    if (!editingSettingValue) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setEditingSetting(true);
    try {
      await settingsApi.updateSetting(editingSettingKey, editingSettingValue, editingSettingGroup as SettingGroupType);
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
      setIsModalOpen(false);
      setEditingSettingKey('');
      setEditingSettingValue('');
      setEditingSettingGroup('');
      loadSettings();
    } catch (_) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
    setEditingSetting(false);
  };

  const handleStartEditing = (key: string, value: string | number | boolean, group: string) => {
    setEditingSettingKey(key);
    setEditingSettingValue(String(value));
    setEditingSettingGroup(group);
    setIsModalOpen(true);
  };

  const renderSettingValue = (key: string, value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      return '••••••••';
    }
    
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Platform Settings</h1>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {Object.keys(groupTitles).map((groupKey) => {
          const groupInfo = groupTitles[groupKey as keyof typeof groupTitles];
          const groupSettings = groupedSettings[groupKey as SettingGroupType] || {};

          return (
            <AccordionItem value={groupKey} key={groupKey} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-lg font-semibold">{groupInfo?.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{groupInfo?.description}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">{groupInfo?.title} Settings</h4>
                    <Dialog open={isModalOpen && (newSetting.group === groupKey || editingSettingGroup === groupKey)} onOpenChange={(open) => {
                      setIsModalOpen(open);
                      if (open && !editingSettingKey) {
                        setNewSetting({ ...newSetting, group: groupKey });
                      } else if (!open) {
                        setNewSetting({ key: '', value: '', group: '' });
                        setEditingSettingKey('');
                        setEditingSettingValue('');
                        setEditingSettingGroup('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add New Setting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingSettingKey ? 'Edit Setting' : 'Add New Setting'}</DialogTitle>
                          <DialogDescription>
                            {editingSettingKey ? 'Edit setting in ' : 'Add a new setting to '} 
                            the {groupInfo?.title} group
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {!editingSettingKey && (
                            <div className="grid gap-2">
                              <Label htmlFor="key">Key</Label>
                              <Input
                                id="key"
                                value={newSetting.key}
                                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                                placeholder="Enter setting key"
                              />
                            </div>
                          )}
                          <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                              id="value"
                              value={editingSettingKey ? editingSettingValue : newSetting.value}
                              onChange={(e) => 
                                editingSettingKey 
                                  ? setEditingSettingValue(e.target.value)
                                  : setNewSetting({ ...newSetting, value: e.target.value })
                              }
                              placeholder="Enter setting value"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={editingSettingKey ? handleEditSetting : handleAddSetting} 
                            disabled={editingSettingKey ? editingSetting : addingSetting}
                          >
                            {editingSettingKey ? (
                              editingSetting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                'Update Setting'
                              )
                            ) : (
                              addingSetting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                'Add Setting'
                              )
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(groupSettings).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{formatKey(key)}</TableCell>
                            <TableCell>{formatSettingValue(key, value)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEditing(key, value, groupKey)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSetting(key, groupKey)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(groupSettings).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No settings found in this group. Click &quot;Add New Setting&quot; to create one.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Edit Setting Dialog */}
      <Dialog open={isModalOpen && editingSettingGroup !== ''} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setEditingSettingKey('');
          setEditingSettingValue('');
          setEditingSettingGroup('');
        }
      }}>
        <DialogTrigger asChild>
          <Button size="sm" className="hidden">
            Edit Setting
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Edit the setting in the {groupTitles[editingSettingGroup as keyof typeof groupTitles]?.title} group
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-key">Key</Label>
              <Input
                id="edit-key"
                value={editingSettingKey}
                onChange={(e) => setEditingSettingKey(e.target.value)}
                placeholder="Enter setting key"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={editingSettingValue}
                onChange={(e) => setEditingSettingValue(e.target.value)}
                placeholder="Enter setting value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSetting} disabled={editingSetting}>
              {editingSetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Setting'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
