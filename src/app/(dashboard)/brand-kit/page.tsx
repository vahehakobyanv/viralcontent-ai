"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Type,
  Image,
  Droplets,
  Save,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CAPTION_STYLES } from "@/lib/constants";

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Oswald", label: "Oswald" },
];

interface BrandKit {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  watermarkText: string;
  captionStyle: string;
}

const DEFAULT_KIT: BrandKit = {
  logoUrl: "",
  primaryColor: "#8b5cf6",
  secondaryColor: "#1e1b4b",
  accentColor: "#f59e0b",
  font: "Inter",
  watermarkText: "Made with ViralContent AI",
  captionStyle: "classic",
};

export default function BrandKitPage() {
  const [kit, setKit] = useState<BrandKit>(DEFAULT_KIT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("brand_kit");
    if (stored) {
      try {
        setKit({ ...DEFAULT_KIT, ...JSON.parse(stored) });
      } catch {
        // Use default
      }
    }
  }, []);

  const update = (field: keyof BrandKit, value: string) => {
    setKit((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("brand_kit", JSON.stringify(kit));
    setSaved(true);
    toast.success("Brand kit saved");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Brand Kit</h1>
        <p className="text-muted-foreground">
          Customize your visual identity for consistent branding across all
          videos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {kit.logoUrl ? (
                  <img
                    src={kit.logoUrl}
                    alt="Brand logo"
                    className="max-h-16 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <Image className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                )}
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your logo below
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={kit.logoUrl}
                  onChange={(e) => update("logoUrl", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "primaryColor" as const, label: "Primary" },
                  { key: "secondaryColor" as const, label: "Secondary" },
                  { key: "accentColor" as const, label: "Accent" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs">{label}</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={kit[key]}
                          onChange={(e) => update(key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                        />
                      </div>
                      <Input
                        value={kit[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="font-mono text-xs h-10"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={kit.font}
                  onValueChange={(v) => v && update("font", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span style={{ fontFamily: f.value }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Watermark */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                Watermark Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="watermark">Custom Watermark</Label>
                <Input
                  id="watermark"
                  placeholder="Made with ViralContent AI"
                  value={kit.watermarkText}
                  onChange={(e) => update("watermarkText", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Caption Preset */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Caption Preset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CAPTION_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => update("captionStyle", style.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      kit.captionStyle === style.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`text-sm font-bold mb-1 ${
                        style.id === "gradient"
                          ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                          : style.id === "outline"
                            ? "text-transparent [-webkit-text-stroke:1px_white]"
                            : style.id === "bold"
                              ? "text-lg"
                              : ""
                      }`}
                    >
                      Aa
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {style.name}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full py-5 text-base glow">
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Brand Kit
              </>
            )}
          </Button>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Preview
            </h3>
            <div
              className="relative mx-auto rounded-[2rem] border-4 border-border bg-black overflow-hidden shadow-2xl"
              style={{ width: 200, height: 430 }}
            >
              {/* Status bar mock */}
              <div className="h-6 bg-black flex items-center justify-center">
                <div className="w-16 h-3 bg-border rounded-full" />
              </div>

              {/* Video area */}
              <div
                className="flex flex-col items-center justify-between p-4 h-[calc(100%-24px)]"
                style={{ backgroundColor: kit.secondaryColor }}
              >
                {/* Logo */}
                <div className="w-full text-center">
                  {kit.logoUrl ? (
                    <img
                      src={kit.logoUrl}
                      alt="Logo"
                      className="h-6 mx-auto object-contain mb-2"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg mx-auto mb-2 opacity-50"
                      style={{ backgroundColor: kit.primaryColor }}
                    />
                  )}
                </div>

                {/* Caption area */}
                <div className="w-full text-center space-y-3">
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{
                      fontFamily: kit.font,
                      color: kit.primaryColor,
                      ...(kit.captionStyle === "gradient"
                        ? {
                            background: `linear-gradient(90deg, ${kit.primaryColor}, ${kit.accentColor})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : kit.captionStyle === "outline"
                          ? {
                              color: "transparent",
                              WebkitTextStroke: `1px ${kit.primaryColor}`,
                            }
                          : {}),
                    }}
                  >
                    Your caption text goes here
                  </p>
                  <div
                    className="h-1 w-12 mx-auto rounded-full"
                    style={{ backgroundColor: kit.accentColor }}
                  />
                </div>

                {/* Watermark */}
                <p className="text-[8px] text-white/40 text-center">
                  {kit.watermarkText}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Live preview of your brand settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
