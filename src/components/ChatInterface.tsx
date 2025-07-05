import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Settings, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Analysis {
  messageIndex: number;
  manipulationScore: number;
  patterns: string[];
  explanation: string;
  timestamp: number;
}

export function ChatInterface() {
  const [currentConversation, setCurrentConversation] = useState<Id<"conversations"> | null>(null);
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.chat.getUserConversations);
  const conversation = useQuery(api.chat.getConversation, 
    currentConversation ? { conversationId: currentConversation } : "skip"
  );
  
  const createConversation = useMutation(api.chat.createConversation);
  const sendMessage = useMutation(api.chat.sendMessage);
  const saveApiKey = useMutation(api.chat.saveApiKey);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    try {
      await saveApiKey({ openaiApiKey: apiKey });
      setShowSettings(false);
      setApiKey("");
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversationId = await createConversation({
        title: `Chat ${new Date().toLocaleDateString()}`,
      });
      setCurrentConversation(conversationId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({
        conversationId: currentConversation,
        message: userMessage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-success";
    if (score < 70) return "text-warning";
    return "text-error";
  };

  const getScoreIcon = (score: number) => {
    if (score < 30) return <CheckCircle className="w-4 h-4" />;
    if (score < 70) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  if (!conversations) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="not-prose max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AntiPsychosis Chat</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleNewConversation}
            className="btn btn-primary btn-sm"
          >
            New Chat
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost btn-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">OpenAI API Key</h3>
          <p className="text-sm text-base-content/70 mb-3">
            Enter your OpenAI API key to enable ChatGPT integration. Your key is stored securely and only used for your chats.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="input input-bordered flex-1"
            />
            <button 
              onClick={handleSaveApiKey}
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!currentConversation && conversations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg mb-4">Welcome to AntiPsychosis!</p>
          <p className="text-base-content/70 mb-6">
            Create your first conversation to start analyzing ChatGPT responses for manipulation patterns.
          </p>
          <button 
            onClick={handleNewConversation}
            className="btn btn-primary btn-lg"
          >
            Start Your First Chat
          </button>
        </div>
      )}

      {currentConversation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-base-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">ChatGPT Conversation</h2>
            
            <div className="h-96 bg-base-100 rounded p-4 mb-4 overflow-y-auto">
              {conversation?.messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-content" 
                      : "bg-base-300 text-base-content"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-base-300">
                    <div className="flex items-center gap-2">
                      <span className="loading loading-dots loading-sm"></span>
                      <span className="text-sm">ChatGPT is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="input input-bordered flex-1"
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="btn btn-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-base-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manipulation Analysis</h2>
            
            <div className="h-96 bg-base-100 rounded p-4 overflow-y-auto">
              {conversation?.analysis.map((analysis, index) => (
                <div key={index} className="mb-4 p-3 border border-base-300 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`flex items-center gap-1 font-semibold ${getScoreColor(analysis.manipulationScore)}`}>
                      {getScoreIcon(analysis.manipulationScore)}
                      Score: {analysis.manipulationScore}/100
                    </span>
                  </div>
                  
                  {analysis.patterns.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Patterns detected:</p>
                      <ul className="text-sm text-base-content/70 ml-4">
                        {analysis.patterns.map((pattern, i) => (
                          <li key={i}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-sm text-base-content/80">{analysis.explanation}</p>
                  
                  <p className="text-xs text-base-content/50 mt-2">
                    {new Date(analysis.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              
              {conversation?.analysis.length === 0 && (
                <p className="text-center text-base-content/50">
                  Send a message to see manipulation analysis...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Previous Conversations</h3>
          <div className="flex flex-wrap gap-2">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setCurrentConversation(conv._id)}
                className={`btn btn-sm ${
                  currentConversation === conv._id ? "btn-primary" : "btn-ghost"
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}