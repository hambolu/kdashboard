import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface SettingFormProps {
  settings: {
    key: string;
    label: string;
    type: string;
    description?: string;
  }[];
  values: Record<string, string>;
  onSubmit: (data: Record<string, string | boolean | number>) => void;
  loading: boolean;
}

type InputType = 'text' | 'number' | 'email' | 'password' | 'url' | 'checkbox';

const getInputType = (key: string, type: string): InputType => {
  const lowerKey = key.toLowerCase();
  
  if (type === 'checkbox' || type === 'boolean') return 'checkbox';
  if (type === 'number') return 'number';
  if (type === 'email' || lowerKey.includes('email')) return 'email';
  if (lowerKey.includes('password') || lowerKey.includes('secret')) return 'password';
  if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('website')) return 'url';
  
  return 'text';
};

const getValidation = (type: string, key: string) => {
  const inputType = getInputType(key, type);
  switch (inputType) {
    case 'number':
      return z.string().transform(Number);
    case 'checkbox':
      return z.boolean().default(false);
    case 'email':
      return z.string().email();
    case 'url':
      return z.string().url();
    default:
      return z.string();
  }
};

export function SettingForm({ settings, values, onSubmit, loading }: SettingFormProps) {
  // Dynamically create the form schema based on settings
  const formSchema = z.object(
    settings.reduce<Record<string, z.ZodType>>((acc, setting) => {
      acc[setting.key] = getValidation(setting.type, setting.key);
      return acc;
    }, {})
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = values[setting.key] ?? '';
      return acc;
    }, {}),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settings.map((setting) => {
            const inputType = getInputType(setting.key, setting.type);
            
            return (
              <FormField
                key={setting.key}
                control={form.control}
                name={setting.key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{setting.label}</FormLabel>
                    <FormControl>
                      {inputType === 'checkbox' ? (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      ) : (
                        <Input
                          type={inputType}
                          placeholder={`Enter ${setting.label.toLowerCase()}`}
                          {...field}
                          value={field.value || ''}
                          autoComplete={inputType === 'password' ? 'new-password' : undefined}
                        />
                      )}
                    </FormControl>
                    {setting.description && (
                      <FormDescription>
                        {setting.description}
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
