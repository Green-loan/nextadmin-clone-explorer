import { useState, useRef, useEffect } from 'react';
import { Bot, SendIcon, ArrowLeft, FileImage, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { pipeline } from '@huggingface/transformers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I\'m your Green Finance AI assistant. I can help you with information about loans, financial advice, and sustainable business ideas. How can I assist you today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Fallback responses about green finance if the model isn't loaded
const FALLBACK_RESPONSES = [
  "Based on your loan history, I recommend considering a green energy loan for solar panels. They typically have lower interest rates and could reduce your operating costs.",
  "Looking at the current market trends, green finance investments are showing promising growth. Would you like me to provide more specific data?",
  "Your current loan portfolio shows a healthy distribution. To optimize further, consider refinancing your highest interest loans first.",
  "I've analyzed your cash flow patterns. You might benefit from our flexible payment schedules for agricultural green loans.",
  "Green Finance offers competitive rates for sustainable business projects. The average APR is currently 5.2% for qualified borrowers.",
];

export function GreenFinanceAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load AI model
  useEffect(() => {
    const loadModel = async () => {
      if (!model && open) {
        try {
          setModelLoading(true);
          // Load the DeepSeek-R1 model
          const textGenerator = await pipeline(
            'text-generation',
            'deepseek-ai/DeepSeek-R1', 
            { 
              trust_remote_code: true,
              device: 'webgpu' // Try to use WebGPU for better performance if available
            }
          );
          setModel(textGenerator);
          toast({
            title: "DeepSeek-R1 Model Loaded",
            description: "Using DeepSeek-R1 language model for responses.",
            variant: "default"
          });
        } catch (error) {
          console.error("Error loading model:", error);
          toast({
            title: "Model Loading Failed",
            description: "Using fallback responses instead.",
            variant: "destructive"
          });
        } finally {
          setModelLoading(false);
        }
      }
    };

    loadModel();
  }, [open, model, toast]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: input, timestamp: currentTime };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let aiResponse: string;
      
      if (model) {
        // Format message history for DeepSeek-R1 model
        const messageHistory = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'Green finance AI' : 'user',
          content: msg.content
        }));
        
        // Add current user message
        messageHistory.push({
          role: 'user',
          content: input
        });
        
        // Generate response with DeepSeek-R1 model
        const result = await model(messageHistory, {
          max_length: 100,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.2,
        });
        
        // Extract the generated text
        aiResponse = result[0].generated_text;
        
        // If the response is empty or low quality, use fallback
        if (!aiResponse || aiResponse.length < 10) {
          aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
        }
      } else {
        // Use fallback response if model is not loaded
        aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      }
      
      // Add AI response to chat with slight delay to simulate typing
      setTimeout(() => {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      
      // Add fallback response
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request right now. Could you please try again later?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-green-500 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>

      {/* WhatsApp-style Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[360px] h-[520px] flex flex-col p-0 gap-0 border-0 bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden">
          {/* WhatsApp-style header */}
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center gap-2 sticky top-0 z-10 shadow-md">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setOpen(false)}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Green Finance Assistant</h2>
                <p className="text-xs opacity-90">
                  {modelLoading ? "Loading DeepSeek-R1 model..." : isLoading ? "Typing..." : "Online"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Chat background with improved visuals */}
          <div 
            className="flex-1 overflow-y-auto py-2 px-3 space-y-2" 
            style={{ 
              background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)"
            }}
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[75%] p-2 rounded-lg shadow-sm text-sm relative",
                    message.role === 'user' 
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none shadow-md"
                  )}
                >
                  {message.content}
                  <div className="text-[10px] text-right mt-1 mr-1"
                    style={{ 
                      color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' 
                    }}
                  >
                    {message.timestamp}
                    {message.role === 'user' && (
                      <span className="ml-1 text-white">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 bg-white rounded-lg rounded-tl-none shadow-md">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area with improved styling */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 p-2 flex gap-2 bg-white shadow-md">
            <div className="flex items-center gap-2 text-gray-500">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-50">
                <Paperclip size={18} />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-50">
                <FileImage size={18} />
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="resize-none min-h-[40px] max-h-[80px] text-sm py-2 rounded-2xl bg-gray-50 border-gray-200 focus-visible:ring-green-500/40 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading || modelLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || modelLoading || !input.trim()}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm flex-shrink-0 transition-all duration-200"
            >
              {isLoading || modelLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SendIcon size={16} />
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
