"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { SortOption } from "@/types";
import { ListRestart, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface UserSettings {
  aiEnabled: boolean;
  defaultAIInputOpen: boolean;
  autoRemoveCompleted: boolean;
  pendingEnabled: boolean;
  defaultViewMode: "date" | "all";
  defaultPriority: "high" | "medium" | "low" | undefined;
  defaultSortBy: SortOption;
  syncWithGoogleCalendar: boolean;
}

export const defaultSettings: UserSettings = {
  aiEnabled: true,
  defaultAIInputOpen: true,
  autoRemoveCompleted: false,
  pendingEnabled: true,
  syncWithGoogleCalendar: true,
  defaultViewMode: "date",
  defaultPriority: undefined,
  defaultSortBy: "newest",
};

export function SettingsPopover({
  onSettingsChange,
  isMobile,
  className,
}: {
  onSettingsChange: (settings: UserSettings) => void;
  isMobile: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    "user-settings",
    defaultSettings
  );

  // Ensure any new default settings are applied to existing saved settings
  useEffect(() => {
    const mergedSettings = { ...defaultSettings, ...settings };

    // Check if merged settings differ from current settings
    if (JSON.stringify(mergedSettings) !== JSON.stringify(settings)) {
      setSettings(mergedSettings);
    }
  }, [settings, setSettings]);

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleSwitchChange = useCallback(
    (checked: boolean, setting: keyof UserSettings) => {
      setSettings({
        ...settings,
        [setting]: checked,
      });
    },
    [settings, setSettings]
  );

  const handleSelectChange = useCallback(
    (value: string, setting: keyof UserSettings) => {
      setSettings({
        ...settings,
        [setting]:
          setting === "defaultPriority" && value === "none" ? undefined : value,
      });
    },
    [settings, setSettings]
  );

  const handleResetSettings = useCallback(() => {
    setSettings(defaultSettings);
    toast.success("Settings reset to defaults");
  }, [setSettings]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const isDefaultSettings = useMemo(
    () => JSON.stringify(settings) === JSON.stringify(defaultSettings),
    [settings]
  );

  const { hasGoogleConnected } = useGoogleCalendar();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-2 border-0 hover:cursor-pointer shadow-none bg-transparent hover:bg-accent/30 hover:text-accent-foreground dark:text-neutral-400 dark:hover:text-foreground",
            className
          )}
        >
          <Settings
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]" align="end" sideOffset={8}>
        <div className="space-y-4">
          <div
            className={cn(
              "flex items-center justify-between",
              isDefaultSettings && "py-1.5"
            )}
          >
            <h4 className="font-medium text-base leading-none">Settings</h4>
            <Button
              variant="ghost"
              size="icon"
              title="Reset to default settings"
              onClick={handleResetSettings}
              className={cn(
                "h-7 w-7 hover:bg-accent/40 cursor-pointer flex border-0 text-muted-foreground hover:text-foreground transition-colors",
                isDefaultSettings && "hidden"
              )}
            >
              <ListRestart className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ai-enabled" className="text-xs">
                AI Features
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable AI capabilities for task creation
              </p>
            </div>
            <Switch
              id="ai-enabled"
              checked={settings.aiEnabled}
              onCheckedChange={(checked) =>
                handleSwitchChange(checked, "aiEnabled")
              }
            />
          </div>
          {!isMobile && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ai-input-default" className="text-xs">
                  Input
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show input by default
                </p>
              </div>
              <Switch
                id="ai-input-default"
                checked={settings.defaultAIInputOpen}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "defaultAIInputOpen")
                }
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-remove-completed" className="text-xs">
                Auto Remove
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically remove completed tasks
              </p>
            </div>
            <Switch
              id="auto-remove-completed"
              checked={settings.autoRemoveCompleted}
              onCheckedChange={(checked) =>
                handleSwitchChange(checked, "autoRemoveCompleted")
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ai-enabled" className="text-xs">
                Pending Indicator
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable Pending Indicator for overdue tasks
              </p>
            </div>
            <Switch
              id="pending-enabled"
              checked={settings.pendingEnabled}
              onCheckedChange={(checked) =>
                handleSwitchChange(checked, "pendingEnabled")
              }
            />
          </div>
          {hasGoogleConnected() && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sync-with-google-calendar" className="text-xs">
                  Sync with Google Calendar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sync tasks with Google Calendar
                </p>
              </div>
              <Switch
                id="sync-with-google-calendar"
                checked={settings.syncWithGoogleCalendar}
                disabled={!hasGoogleConnected()}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "syncWithGoogleCalendar")
                }
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="default-view" className="text-xs">
                Default View
              </Label>
              <p className="text-xs text-muted-foreground">
                Preferred default view mode
              </p>
            </div>
            <Select
              value={settings.defaultViewMode}
              onValueChange={(value) =>
                handleSelectChange(value, "defaultViewMode")
              }
            >
              <SelectTrigger className="max-w-[95px] w-full cursor-pointer h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem
                  value="date"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Date
                </SelectItem>
                <SelectItem
                  value="all"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  All
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="default-priority" className="text-xs">
                Default Priority
              </Label>
              <p className="text-xs text-muted-foreground">
                Default priority for new tasks
              </p>
            </div>
            <Select
              value={settings.defaultPriority || "none"}
              onValueChange={(value) =>
                handleSelectChange(value, "defaultPriority")
              }
            >
              <SelectTrigger className="max-w-[95px] w-full cursor-pointer h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem
                  value="none"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  None
                </SelectItem>
                <SelectItem
                  value="high"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  High
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Medium
                </SelectItem>
                <SelectItem
                  value="low"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="default-sort" className="text-xs">
                Default Sort
              </Label>
              <p className="text-xs text-muted-foreground">
                Preferred task sorting order
              </p>
            </div>
            <Select
              value={settings.defaultSortBy}
              onValueChange={(value) =>
                handleSelectChange(value, "defaultSortBy")
              }
            >
              <SelectTrigger className="max-w-[95px] w-full cursor-pointer h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem
                  value="newest"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Newest
                </SelectItem>
                <SelectItem
                  value="oldest"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Oldest
                </SelectItem>
                <SelectItem
                  value="priority"
                  className="cursor-pointer hover:bg-accent/30"
                >
                  Priority
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
