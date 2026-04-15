"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCRIPT_TEMPLATES } from "@/lib/constants";
import type { ScriptTemplate } from "@/types";

interface ScriptTemplatesProps {
  onSelectTemplate: (template: ScriptTemplate) => void;
}

export default function ScriptTemplates({
  onSelectTemplate,
}: ScriptTemplatesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {SCRIPT_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onSelectTemplate(template)}
        >
          <CardContent className="p-5 space-y-3">
            <div className="text-3xl">{template.emoji}</div>
            <h3 className="font-bold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
            <Badge variant="secondary">{template.category}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
