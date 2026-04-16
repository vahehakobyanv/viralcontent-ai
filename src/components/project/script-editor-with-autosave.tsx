"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AutoSaveIndicator, {
  type SaveStatus,
} from "@/components/project/auto-save-indicator";
import { createClient } from "@/lib/supabase/client";
import { Save } from "lucide-react";

interface ScriptEditorWithAutosaveProps {
  scriptId: string;
  initialValue: string;
  onSave?: (text: string) => void;
}

export default function ScriptEditorWithAutosave({
  scriptId,
  initialValue,
  onSave,
}: ScriptEditorWithAutosaveProps) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSave = async (text: string) => {
    setStatus("saving");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("scripts")
        .update({ content: text, updated_at: new Date().toISOString() })
        .eq("id", scriptId);
      if (error) throw error;
      setStatus("saved");
      onSave?.(text);
    } catch (e) {
      console.error("[autosave]", e);
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSave(text);
    }, 1500);
  };

  const saveNow = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <AutoSaveIndicator status={status} />
        <Button
          variant="outline"
          size="sm"
          onClick={saveNow}
          disabled={status === "saving"}
        >
          <Save className="h-3 w-3 mr-2" /> Save Now
        </Button>
      </div>
      <Textarea
        rows={10}
        value={value}
        onChange={handleChange}
        className="font-mono text-sm"
      />
    </div>
  );
}
