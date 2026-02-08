"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Upload, Play, Save, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminConfigTab({
  configData,
  setConfigData,
  loading,
  setLoading,
  setMessage,
  setMessageType,
  uploadedFile,
  setUploadedFile,
  fileInputRef,
  fetchConfig,
  saveConfig,
  handleTestParse,
  handleParseSaveAll,
  handleFileSelect,
  promptConfigOpen,
  setPromptConfigOpen,
  prompt2Open,
  setPrompt2Open,
  prompt3Open,
  setPrompt3Open,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <p className="text-sm text-gray-500">Upload source document containing MCQs (questions + options only). Accepts: PDF, DOCX.</p>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drop file here or click to upload</p>
            {uploadedFile && <p className="mt-1 text-xs text-green-600">{uploadedFile.name}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Parsing Instructions (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Optional instructions for formatting, numbering..."
            value={configData.parsingInstructions}
            onChange={(e) => setConfigData({ ...configData, parsingInstructions: e.target.value })}
            rows={2}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">Prompt Configuration</h3>
        <Card className="overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/80 transition-colors"
            onClick={() => setPromptConfigOpen(!promptConfigOpen)}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">Prompt 1: Parse & Separate Questions</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">v2.1.0</span>
            </div>
            {promptConfigOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
          <CardContent className="pt-0 pb-4">
            <p className="text-sm text-gray-500 px-4 -mt-2 mb-3">Extract individual questions from uploaded document.</p>
            {promptConfigOpen && (
              <Textarea
                placeholder="Your parsing prompt (document content will be injected dynamically; output JSON structure is fixed)."
                value={configData.parsing_prompt}
                onChange={(e) => setConfigData({ ...configData, parsing_prompt: e.target.value })}
                rows={6}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/80 transition-colors"
            onClick={() => setPrompt2Open(!prompt2Open)}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">Prompt 2: Generate New Question</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">v1.8.0</span>
            </div>
            {prompt2Open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
          <CardContent className="pt-0 pb-4">
            <p className="text-sm text-gray-500 px-4 -mt-2 mb-3">Create new questions based on parsed content.</p>
            {prompt2Open && (
              <Textarea
                placeholder="Your generation prompt. OpenAI will use this to generate new questions with options, option explanations, correct answers, and explanation."
                value={configData.generate_prompt}
                onChange={(e) => setConfigData({ ...configData, generate_prompt: e.target.value })}
                rows={6}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/80 transition-colors"
            onClick={() => setPrompt3Open(!prompt3Open)}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">Prompt 3: Validate Generated Answer</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">v1.5.2</span>
            </div>
            {prompt3Open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
          <CardContent className="pt-0 pb-4">
            <p className="text-sm text-gray-500 px-4 -mt-2 mb-3">Verify accuracy of generated questions. Gemini gets only question + options (not OpenAI answer).</p>
            {prompt3Open && (
              <Textarea
                placeholder={'Your validation prompt. Gemini gets only question + options; it must return JSON with "answer" or "answers" key.'}
                value={configData.validation_prompt}
                onChange={(e) => setConfigData({ ...configData, validation_prompt: e.target.value })}
                rows={6}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Determinism & Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Max Retry Count (0–10)</Label>
            <input
              type="number"
              min={0}
              max={10}
              value={configData.maxRetryCount}
              onChange={(e) => setConfigData({ ...configData, maxRetryCount: Number(e.target.value) || 3 })}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <Label>Temperature (0–2)</Label>
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={configData.temperature}
              onChange={(e) => setConfigData({ ...configData, temperature: Number(e.target.value) ?? 0.3 })}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <Label>Top P (0–1)</Label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={configData.topP}
              onChange={(e) => setConfigData({ ...configData, topP: Number(e.target.value) ?? 0.9 })}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <Label>Frequency Penalty (-2 to 2)</Label>
            <input
              type="number"
              min={-2}
              max={2}
              step={0.1}
              value={configData.frequencyPenalty}
              onChange={(e) => setConfigData({ ...configData, frequencyPenalty: Number(e.target.value) ?? 0.2 })}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <Label>Presence Penalty (-2 to 2)</Label>
            <input
              type="number"
              min={-2}
              max={2}
              step={0.1}
              value={configData.presencePenalty}
              onChange={(e) => setConfigData({ ...configData, presencePenalty: Number(e.target.value) ?? 0 })}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <Label>Gemini Model (document parsing)</Label>
            <Select
              value={configData.geminiModelSelector}
              onValueChange={(v) => setConfigData({ ...configData, geminiModelSelector: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Gemini 2.5</SelectLabel>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Gemini 1.5</SelectLabel>
                  <SelectItem value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</SelectItem>
                  <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Latest)</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </SelectGroup>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>OpenAI / GPT Model</Label>
            <Select
              value={configData.modelSelector}
              onValueChange={(v) => setConfigData({ ...configData, modelSelector: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleTestParse} disabled={loading} variant="outline">
          <Play className="w-4 h-4 mr-2" /> Test Parse (First 5 Questions)
        </Button>
        <Button onClick={handleParseSaveAll} disabled={loading}>
          <Upload className="w-4 h-4 mr-2" /> Parse & Save All
        </Button>
        <Button onClick={saveConfig} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" /> Save Configuration
        </Button>
      </div>
    </div>
  );
}
