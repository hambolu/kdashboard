"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SettingInputProps {
  id: string;
  label: string;
  value: string | number | boolean;
  type?: 'text' | 'number' | 'password' | 'checkbox';
  onChange: (value: string | number | boolean) => void;
  disabled?: boolean;
}

export function SettingInput({ 
  id, 
  label, 
  value, 
  type = 'text',
  onChange,
  disabled = false
}: SettingInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (newValue: string | number | boolean) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  if (type === 'checkbox') {
    return (
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor={id}>{label}</Label>
        <Switch
          id={id}
          checked={Boolean(inputValue)}
          onCheckedChange={handleChange}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={String(inputValue)}
        onChange={(e) => handleChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
