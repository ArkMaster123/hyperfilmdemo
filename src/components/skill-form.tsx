"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Zap } from "lucide-react";

export interface FieldSchema {
  name: string;
  type: "string" | "number" | "enum" | "boolean";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

interface SkillFormProps {
  fields: FieldSchema[];
  onSubmit: (data: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function SkillForm({
  fields,
  onSubmit,
  disabled = false,
}: SkillFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      } else if (field.type === "boolean") {
        initial[field.name] = false;
      } else if (field.type === "number") {
        initial[field.name] = field.min ?? 0;
      } else {
        initial[field.name] = "";
      }
    }
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(formData);
  };

  // Determine if a string field should be a textarea (heuristic: description-like labels)
  const isLongText = (field: FieldSchema) => {
    const longKeywords = ["description", "details", "notes", "content", "body", "message", "additional"];
    return longKeywords.some((kw) =>
      field.name.toLowerCase().includes(kw) || field.label.toLowerCase().includes(kw)
    );
  };

  const loading = disabled || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          {/* Don't show label for boolean since we show it inline */}
          {field.type !== "boolean" && (
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground/90"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-rose-500/70">*</span>
              )}
            </Label>
          )}

          {field.description && field.type !== "boolean" && (
            <p className="text-xs text-muted-foreground/70 -mt-0.5">
              {field.description}
            </p>
          )}

          {field.type === "string" && !isLongText(field) && (
            <Input
              id={field.name}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={(formData[field.name] as string) || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="h-9 bg-background/50"
            />
          )}

          {field.type === "string" && isLongText(field) && (
            <Textarea
              id={field.name}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={(formData[field.name] as string) || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="min-h-24 bg-background/50 resize-none"
            />
          )}

          {field.type === "number" && (
            <Input
              id={field.name}
              type="number"
              placeholder="0"
              min={field.min}
              max={field.max}
              value={(formData[field.name] as number) ?? ""}
              onChange={(e) =>
                updateField(field.name, parseFloat(e.target.value) || 0)
              }
              disabled={disabled}
              required={field.required}
              className="h-9 bg-background/50"
            />
          )}

          {field.type === "enum" && field.options && (
            <Select
              value={formData[field.name] as string}
              onValueChange={(val) => updateField(field.name, val)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full h-9 bg-background/50">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "boolean" && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={!!formData[field.name]}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                  disabled={disabled}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-violet-500 peer-disabled:opacity-50" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-rose-500/70">*</span>
                  )}
                </span>
                {field.description && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {field.description}
                  </p>
                )}
              </div>
            </label>
          )}
        </div>
      ))}

      <div className="pt-3">
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full gap-2 h-10 bg-foreground text-background hover:bg-foreground/90 font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="size-4" />
              Generate
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
