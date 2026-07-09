"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";

export default function ExamBasicFormFields({
  form,
  setForm,
  categories = [],
  providers = [],
  providerDropdownOpen,
  setProviderDropdownOpen,
  idPrefix = "",
  hideOfficialDetailsToggle = false,
}) {
  const p = idPrefix ? `${idPrefix}_` : "";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">
          Exam Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${p}name`}>Exam Name *</Label>
            <Input
              id={`${p}name`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="AWS Solutions Architect Associate"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${p}slug`}>Exam Slug *</Label>
            <Input
              id={`${p}slug`}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Enter slug exactly as it should appear in the URL"
              required
              className="mt-1"
            />
            <p className="text-xs text-[#1A73E8] font-medium mt-2">
              Live URL:{" "}
              <code className="bg-blue-50 px-1.5 py-0.5 rounded text-[#0C1A35]">
                {form.slug?.trim()
                  ? `/${String(form.slug).trim().replace(/^\/+|\/+$/g, "")}`
                  : "/your-exam-slug"}
              </code>
            </p>
          </div>
          <div>
            <Label htmlFor={`${p}code`}>Exam Code (Optional)</Label>
            <Input
              id={`${p}code`}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g., SAA-C03, AZ-104"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${p}category`}>Category *</Label>
            <Select
              value={form.category || ""}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug || cat.id} value={cat.slug || String(cat.id)}>
                    {cat.title || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor={`${p}provider`}>Provider (Optional)</Label>
          <Popover
            open={providerDropdownOpen}
            onOpenChange={setProviderDropdownOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={providerDropdownOpen}
                className="w-full justify-between mt-1"
              >
                {form.provider
                  ? providers.find(
                      (p) => String(p.id) === String(form.provider)
                    )?.name
                  : "Select a provider..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search provider..." />
                <CommandList>
                  <CommandEmpty>No provider found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="no provider"
                      onSelect={() => {
                        setForm({ ...form, provider: "" });
                        setProviderDropdownOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !form.provider ? "opacity-100" : "opacity-0"
                        )}
                      />
                      No provider
                    </CommandItem>
                    {providers.map((provider) => (
                      <CommandItem
                        key={provider.id}
                        value={provider.name}
                        onSelect={() => {
                          setForm({ ...form, provider: provider.id });
                          setProviderDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(form.provider) === String(provider.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {provider.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor={`${p}badge`}>Badge</Label>
          <Input
            id={`${p}badge`}
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="e.g., New, Updated, Popular"
            className="mt-1"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id={`${p}is_featured`}
            checked={!!form.is_featured}
            onCheckedChange={(checked) =>
              setForm({ ...form, is_featured: checked === true })
            }
          />
          <div>
            <Label htmlFor={`${p}is_featured`}>Popular Exam (Featured)</Label>
            <p className="text-xs text-gray-500">
              Shows in Home page Featured Exams and Exam sidebar Popular Exams.
            </p>
          </div>
        </div>

        {!hideOfficialDetailsToggle ? (
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id={`${p}show_in_official_details`}
              checked={!!form.show_in_official_details}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  show_in_official_details: checked === true,
                })
              }
            />
            <div>
              <Label htmlFor={`${p}show_in_official_details`}>
                Add To Official Details
              </Label>
              <p className="text-xs text-gray-500">
                Optional. Enable only when this exam should also appear in
                Official Details Manager.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">
          SEO Meta Tags
        </h3>

        <div>
          <Label htmlFor={`${p}meta_title`}>Meta Title</Label>
          <Input
            id={`${p}meta_title`}
            value={form.meta_title}
            onChange={(e) =>
              setForm({ ...form, meta_title: e.target.value })
            }
            placeholder="Exam Name - Certification Prep | AllExamQuestions"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${p}meta_keywords`}>Meta Keywords</Label>
          <Input
            id={`${p}meta_keywords`}
            value={form.meta_keywords}
            onChange={(e) =>
              setForm({ ...form, meta_keywords: e.target.value })
            }
            placeholder="course, exam, certification, practice test"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${p}meta_description`}>Meta Description</Label>
          <Textarea
            id={`${p}meta_description`}
            value={form.meta_description}
            onChange={(e) =>
              setForm({ ...form, meta_description: e.target.value })
            }
            placeholder="Brief description for search results"
            rows={3}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
