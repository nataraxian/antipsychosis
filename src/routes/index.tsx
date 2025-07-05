import { SignInButton } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Shield, Brain, AlertTriangle } from "lucide-react";
import { ChatInterface } from "../components/ChatInterface";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="text-center">
      <div className="not-prose flex justify-center mb-4">
        <Shield className="w-16 h-16 text-primary" />
      </div>
      <h1>AntiPsychosis</h1>
      <p className="text-xl mb-6">AI Manipulation Detection & Protection</p>

      <Unauthenticated>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-base-200 rounded-lg">
              <Brain className="w-8 h-8 text-info mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Real-time Analysis</h3>
              <p className="text-sm opacity-70">Analyze ChatGPT responses as you chat</p>
            </div>
            <div className="p-4 bg-base-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Manipulation Detection</h3>
              <p className="text-sm opacity-70">Identify sycophantic and manipulative patterns</p>
            </div>
            <div className="p-4 bg-base-200 rounded-lg">
              <Shield className="w-8 h-8 text-success mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Mental Protection</h3>
              <p className="text-sm opacity-70">Stay aware of psychological influence</p>
            </div>
          </div>
          <p className="mb-4">Get real-time commentary on your ChatGPT conversations to protect against AI-induced psychological manipulation.</p>
        </div>
        <div className="not-prose">
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-lg">Start Analyzing</button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <ChatInterface />
      </Authenticated>
    </div>
  );
}

