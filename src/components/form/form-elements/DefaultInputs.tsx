"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import { EyeCloseIcon, EyeIcon } from '../../../icons';
import DatePicker from '@/components/form/date-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DefaultInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState("");
  
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];

  return (
    <ComponentCard title="Default Inputs">
      <div className="space-y-6">
        <div>
          <Label>Input</Label>
          <Input type="text" />
        </div>
        <div>
          <Label>Input with Placeholder</Label>
          <Input type="text" placeholder="info@gmail.com" />
        </div>
        <div>
          <Label>Select Input</Label>
          <div className="relative">
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="w-full dark:bg-dark-900">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Password Input</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>
        </div>
        <div>
          <Label>Date Picker</Label>
          <div className="relative">
            <DatePicker id="date-picker-default" />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
