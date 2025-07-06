"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Brain, Eye, TrendingUp, MessageSquare, Loader2, Sparkles } from "lucide-react"
import { analyzeConversation, type AnalysisResult } from "./actions"

export default function SecondThought() {
  const [chatInput, setChatInput] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzeText = async () => {
    if (!chatInput.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const result = await analyzeConversation(chatInput)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: "High", color: "bg-red-500", textColor: "text-red-700" }
    if (score >= 40) return { level: "Medium", color: "bg-amber-500", textColor: "text-amber-700" }
    return { level: "Low", color: "bg-emerald-500", textColor: "text-emerald-700" }
  }

  const getTrustLevel = (score: number) => {
    if (score >= 70) return { level: "High", color: "bg-emerald-500", textColor: "text-emerald-700" }
    if (score >= 40) return { level: "Medium", color: "bg-amber-500", textColor: "text-amber-700" }
    return { level: "Low", color: "bg-red-500", textColor: "text-red-700" }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">SecondThought</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered analysis of your conversations for psychological safety and cognitive independence.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Input Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-slate-900">Analyze Your Conversation</CardTitle>
            <CardDescription className="text-base text-slate-600">
              Paste your AI conversation below for psychological safety analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700">Conversation Text</label>
              </div>
              <Textarea
                placeholder="Paste your conversation here..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="min-h-32 text-base resize-none"
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleAnalyzeText}
                disabled={!chatInput.trim() || isAnalyzing}
                className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with Gemini AI...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze Conversation
                  </div>
                )}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Trust Score Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
                  <Brain className="h-6 w-6" />
                  Gemini AI Analysis Results
                </CardTitle>
                <CardDescription>Advanced psychological safety analysis powered by Google Gemini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Overall Trust Score</span>
                        <Badge
                          variant={
                            analysis.trustScore >= 70
                              ? "default"
                              : analysis.trustScore >= 40
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {analysis.trustScore}/100
                        </Badge>
                      </div>
                      <Progress value={analysis.trustScore} className="h-3" />
                      <p className="text-sm text-slate-600">
                        {getTrustLevel(analysis.trustScore).level} trust level -{" "}
                        {analysis.trustScore >= 70
                          ? "Conversation appears psychologically safe"
                          : analysis.trustScore >= 40
                            ? "Some concerning patterns detected"
                            : "Significant psychological risks identified"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Manipulation Risk</span>
                        <Badge
                          variant={getRiskLevel(analysis.flatteryIndex).level === "High" ? "destructive" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {getRiskLevel(analysis.flatteryIndex).level}
                        </Badge>
                      </div>
                      <Progress value={analysis.flatteryIndex} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Dependency Risk</span>
                        <Badge
                          variant={
                            getRiskLevel(analysis.dependencyGradient).level === "High" ? "destructive" : "secondary"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {getRiskLevel(analysis.dependencyGradient).level}
                        </Badge>
                      </div>
                      <Progress value={analysis.dependencyGradient} className="h-3" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Emotional Attachment</span>
                        <Badge
                          variant={
                            getRiskLevel(analysis.emotionalBondingLevel).level === "High" ? "destructive" : "secondary"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {getRiskLevel(analysis.emotionalBondingLevel).level}
                        </Badge>
                      </div>
                      <Progress value={analysis.emotionalBondingLevel} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Reality Distortion</span>
                        <Badge
                          variant={
                            getRiskLevel(analysis.realityDistortionPotential).level === "High"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {getRiskLevel(analysis.realityDistortionPotential).level}
                        </Badge>
                      </div>
                      <Progress value={analysis.realityDistortionPotential} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Critical Thinking Impact</span>
                        <Badge
                          variant={
                            getRiskLevel(analysis.criticalThinkingSuppression).level === "High"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {getRiskLevel(analysis.criticalThinkingSuppression).level}
                        </Badge>
                      </div>
                      <Progress value={analysis.criticalThinkingSuppression} className="h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="risks" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12">
                <TabsTrigger value="risks" className="text-base">
                  Risks
                </TabsTrigger>
                <TabsTrigger value="patterns" className="text-base">
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="temporal" className="text-base">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="protection" className="text-base">
                  Guidance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="risks" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      AI-Identified Risks
                    </CardTitle>
                    <CardDescription>Specific psychological risks detected by Gemini analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.risks.map((risk, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">{risk}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patterns" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Eye className="h-5 w-5 text-blue-600" />
                      Detected Patterns
                    </CardTitle>
                    <CardDescription>
                      Specific manipulation patterns and concerning behaviors identified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.patterns.map((pattern, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-blue-800">{pattern}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="temporal" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Risk Timeline
                    </CardTitle>
                    <CardDescription>How these patterns might develop over time without intervention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-600 text-lg">Short-term</h4>
                        <ul className="space-y-2">
                          {analysis.temporalDynamics.shortTerm.map((risk, index) => (
                            <li key={index} className="text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-amber-600 text-lg">Medium-term</h4>
                        <ul className="space-y-2">
                          {analysis.temporalDynamics.mediumTerm.map((risk, index) => (
                            <li key={index} className="text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-700 text-lg">Long-term</h4>
                        <ul className="space-y-2">
                          {analysis.temporalDynamics.longTerm.map((risk, index) => (
                            <li key={index} className="text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-red-700 rounded-full mt-2 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="protection" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      AI-Generated Guidance
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your specific conversation patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 text-lg">Personalized Recommendations</h4>
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                            <p className="text-emerald-800 font-medium">{rec}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-4 text-slate-900 text-lg">Critical Thinking Prompts</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm text-slate-700">"What evidence supports this conclusion?"</p>
                          </div>
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm text-slate-700">"Who might disagree with this view and why?"</p>
                          </div>
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm text-slate-700">"How might this advice fail in practice?"</p>
                          </div>
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm text-slate-700">"What would a trusted peer say about this?"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-600">
            SecondThought uses Google Gemini AI to help you maintain cognitive independence.
          </p>
        </div>
      </div>
    </div>
  )
}
