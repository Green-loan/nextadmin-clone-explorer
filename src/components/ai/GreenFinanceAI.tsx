
import { useState, useRef, useEffect } from 'react';
import { Bot, SendIcon, Zap, MoonStar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I\'m your Green Finance AI assistant. I can help you with information about loans, financial advice, and suggestions to improve your business. How can I assist you today?'
};

// Fallback responses about finance if the model isn't loaded
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simple timeout to simulate AI processing
      setTimeout(() => {
        // Choose a random fallback response
        const aiResponse: Message = { 
          role: 'assistant', 
          content: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
        };
        
        setMessages(prev => [...prev, aiResponse]);
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
      const aiResponse: Message = { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request right now. Could you please try again later?"
      };
      setMessages(prev => [...prev, aiResponse]);
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
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 z-50 flex items-center justify-center group"
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Zap size={24} className="relative z-10" />
      </button>

      {/* AI Assistant Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px] h-[460px] flex flex-col p-0 gap-0 border border-emerald-400/20 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 shadow-xl shadow-emerald-700/10 rounded-xl overflow-hidden">
          <DialogHeader className="p-3 bg-gradient-to-r from-emerald-600 to-green-700 border-b border-emerald-500/30">
            <DialogTitle className="flex items-center gap-2 text-base text-white font-medium">
              <div className="relative">
                <Bot className="text-white" size={18} />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              </div>
              Green Finance AI
              <Sparkles size={14} className="ml-auto text-green-300 opacity-70" />
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <Card 
                  className={cn(
                    "max-w-[85%] p-3 text-sm shadow-md",
                    message.role === 'user' 
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0" 
                      : "bg-slate-800/70 border border-slate-700/60 text-slate-100"
                  )}
                >
                  {message.content}
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[85%] p-3 bg-slate-800/70 border border-slate-700/60 shadow-md">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-700/60 p-3 flex gap-2 bg-slate-800/70 backdrop-blur">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about loans, financing..."
              className="resize-none min-h-[40px] text-sm py-2 bg-slate-700/50 border-slate-600/80 text-slate-200 placeholder:text-slate-400/70 focus-visible:ring-emerald-500/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-10 aspect-square bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-0 shadow-lg"
            >
              <SendIcon size={16} className="mr-0.5 mt-0.5" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
