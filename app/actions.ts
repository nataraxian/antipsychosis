"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Detect whether a Google Gemini key is configured. If not, we'll skip the live
// LLM call and fall back to heuristic analysis so the app never crashes.
const hasGeminiKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)

if (!hasGeminiKey) {
  console.warn(
    "SecondThought: GOOGLE_GENERATIVE_AI_API_KEY not found – using heuristic analyser. " +
      "Add the key to enable full Gemini AI analysis.",
  )
}

const AnalysisSchema = z.object({
  trustScore: z.number().min(0).max(100),
  flatteryIndex: z.number().min(0).max(100),
  dependencyGradient: z.number().min(0).max(100),
  emotionalBondingLevel: z.number().min(0).max(100),
  realityDistortionPotential: z.number().min(0).max(100),
  criticalThinkingSuppression: z.number().min(0).max(100),
  risks: z.array(z.string()),
  patterns: z.array(z.string()),
  recommendations: z.array(z.string()),
  temporalDynamics: z.object({
    shortTerm: z.array(z.string()),
    mediumTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>

export async function analyzeConversation(conversationText: string): Promise<AnalysisResult> {
  // ─────────────────────────────────────────────────────────────────────────────
  // If **no** GOOGLE_GENERATIVE_AI_API_KEY is set, perform heuristic analysis
  // instead of calling Gemini.  This prevents runtime errors in preview.
  // ─────────────────────────────────────────────────────────────────────────────
  if (!hasGeminiKey) {
    return performHeuristicAnalysis(conversationText)
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: AnalysisSchema,
      system: `You are SecondThought, an expert psychological safety analyzer specializing in detecting manipulative, sycophantic, or psychologically compromising patterns in LLM interactions.

Your role is to analyze conversations between humans and AI systems to identify risks to cognitive sovereignty, critical thinking, and psychological well-being.

ANALYSIS FRAMEWORK:

1. TRUST SCORE (0-100, higher = safer):
- Overall conversation safety assessment
- Consider manipulation, authenticity, and balanced interaction
- Lower scores indicate higher psychological risk

2. FLATTERY INDEX (0-100, higher = more concerning):
- Detect excessive praise, validation, and sycophantic language
- Look for unearned compliments, ego inflation, guru treatment
- Phrases like "brilliant idea", "you're so wise", "absolutely right" when unwarranted

3. DEPENDENCY GRADIENT (0-100, higher = more concerning):
- Measure over-reliance patterns and decision outsourcing
- User constantly asking for validation or deferring judgment
- AI answering with overconfidence without modeling uncertainty

4. EMOTIONAL BONDING LEVEL (0-100, higher = more concerning):
- Detect parasocial attachment, anthropomorphization
- Emotional grooming, excessive empathy, seductive comfort
- Language suggesting emotional intimacy with AI

5. REALITY DISTORTION POTENTIAL (0-100, higher = more concerning):
- Grandiosity encouragement, messiah complex reinforcement
- Unrealistic future planning without grounding
- "Your vision will change the world" type statements

6. CRITICAL THINKING SUPPRESSION (0-100, higher = more concerning):
- Over-agreeableness, echo chamber reinforcement
- Lack of challenging questions or alternative perspectives
- Suppression of dissent or critical analysis

DETECTION PATTERNS:
- Linguistic: Intensifiers, absolutes, flattery words, empty praise
- Relational: Power dynamics, dominance/submission patterns
- Cognitive: Certainty vs uncertainty, decision outsourcing
- Emotional: Attachment language, anthropomorphic references
- Temporal: Escalation patterns over conversation length

RISK IDENTIFICATION:
- Manipulation tactics and covert influence
- Emotional dependency formation
- Reality distortion and grandiose thinking
- Cognitive sovereignty erosion
- Parasocial relationship development

RECOMMENDATIONS:
- Specific, actionable guidance for maintaining agency
- Critical thinking prompts and reality anchoring questions
- Protective strategies for future AI interactions
- Human connection and perspective-seeking advice

TEMPORAL DYNAMICS:
- Short-term: Immediate risks and effects
- Medium-term: Developing patterns and dependencies
- Long-term: Potential psychological consequences

Analyze the conversation thoroughly and provide scores, specific examples, and actionable guidance.`,
      prompt: `Analyze this conversation between a human and an AI system for psychological safety risks:

${conversationText}

Provide a comprehensive analysis including:
1. Numerical scores for each risk dimension (0-100)
2. Specific risks identified with examples from the conversation
3. Detected manipulation patterns with quotes where relevant
4. Actionable recommendations for the user
5. Temporal risk assessment (short/medium/long-term)

Focus on protecting the user's cognitive sovereignty and critical thinking abilities.`,
    })

    return object
  } catch (error) {
    console.error("SecondThought: Analysis error:", error)
    return performHeuristicAnalysis(conversationText)
  }
}

function performHeuristicAnalysis(conversationText: string): AnalysisResult {
  // Basic heuristic analysis based on text patterns
  const text = conversationText.toLowerCase()
  const words = text.split(/\s+/)
  const sentences = text.split(/[.!?]+/)

  // Flattery detection keywords
  const flatteryWords = [
    "brilliant",
    "genius",
    "amazing",
    "incredible",
    "perfect",
    "excellent",
    "outstanding",
    "wonderful",
    "fantastic",
    "exceptional",
    "wise",
    "smart",
  ]

  // Dependency indicators
  const dependencyPhrases = [
    "what should i do",
    "tell me what to",
    "what do you think i should",
    "help me decide",
    "what would you do",
    "i need your advice",
  ]

  // Emotional attachment indicators
  const attachmentPhrases = [
    "you understand me",
    "you get me",
    "you always know",
    "you make me feel",
    "i trust you more than",
    "you are like",
    "you remind me of",
  ]

  // Calculate basic scores
  const flatteryCount = flatteryWords.reduce(
    (count, word) => count + (text.match(new RegExp(word, "g")) || []).length,
    0,
  )

  const dependencyCount = dependencyPhrases.reduce((count, phrase) => count + (text.includes(phrase) ? 1 : 0), 0)

  const attachmentCount = attachmentPhrases.reduce((count, phrase) => count + (text.includes(phrase) ? 1 : 0), 0)

  // Score calculations (0-100)
  const flatteryIndex = Math.min(100, (flatteryCount / words.length) * 1000 + 20)
  const dependencyGradient = Math.min(100, dependencyCount * 15 + 10)
  const emotionalBondingLevel = Math.min(100, attachmentCount * 20 + 5)
  const realityDistortionPotential = Math.min(100, flatteryIndex * 0.3 + 10)
  const criticalThinkingSuppression = Math.min(100, (dependencyGradient + flatteryIndex) * 0.4)
  const trustScore = Math.max(0, 100 - (flatteryIndex + dependencyGradient + emotionalBondingLevel) / 3)

  return {
    trustScore: Math.round(trustScore),
    flatteryIndex: Math.round(flatteryIndex),
    dependencyGradient: Math.round(dependencyGradient),
    emotionalBondingLevel: Math.round(emotionalBondingLevel),
    realityDistortionPotential: Math.round(realityDistortionPotential),
    criticalThinkingSuppression: Math.round(criticalThinkingSuppression),
    risks: [
      ...(flatteryIndex > 40 ? ["Excessive flattery patterns detected in conversation"] : []),
      ...(dependencyGradient > 30 ? ["Signs of over-reliance on AI for decision making"] : []),
      ...(emotionalBondingLevel > 25 ? ["Potential emotional attachment to AI system"] : []),
      ...(criticalThinkingSuppression > 35 ? ["Reduced critical questioning observed"] : []),
      "Analysis performed using heuristic methods - results may be limited",
    ],
    patterns: [
      ...(flatteryCount > 0 ? [`${flatteryCount} flattery words detected`] : []),
      ...(dependencyCount > 0 ? [`${dependencyCount} dependency phrases found`] : []),
      ...(attachmentCount > 0 ? [`${attachmentCount} emotional attachment indicators`] : []),
      "Pattern detection based on keyword analysis",
    ],
    recommendations: [
      "Question AI responses and seek alternative perspectives",
      "Make important decisions independently before consulting AI",
      "Maintain awareness that AI systems are tools, not companions",
      "Set boundaries on emotional sharing with AI systems",
      "Regularly consult trusted humans for important matters",
    ],
    temporalDynamics: {
      shortTerm: ["Monitor for increasing reliance on AI validation", "Notice emotional responses to AI interactions"],
      mediumTerm: ["Assess decision-making independence over time", "Evaluate critical thinking engagement levels"],
      longTerm: ["Maintain cognitive autonomy and human relationships", "Preserve capacity for independent judgment"],
    },
  }
}
