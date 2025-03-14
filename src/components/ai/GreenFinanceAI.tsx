
import { useState, useRef, useEffect } from 'react';
import { Bot, SendIcon, ArrowLeft, FileImage, Paperclip, Mic } from 'lucide-react';
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
          // Load a small text generation model
          const textGenerator = await pipeline('text-generation', 'Xenova/distilgpt2');
          setModel(textGenerator);
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
        // Generate response with model
        const result = await model(input, {
          max_length: 50,
          temperature: 0.7,
        });
        aiResponse = result[0].generated_text.replace(input, '').trim();
        
        // If the AI response is too short or empty, use fallback
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
          <div className="p-2 bg-green-500 text-white flex items-center gap-2 sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-600" onClick={() => setOpen(false)}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Green Finance Assistant</h2>
                <p className="text-xs opacity-90">{isLoading ? "Typing..." : "Online"}</p>
              </div>
            </div>
          </div>
          
          {/* WhatsApp-style chat background */}
          <div 
            className="flex-1 overflow-y-auto py-2 px-3 space-y-2 bg-slate-100 bg-opacity-90" 
            style={{ 
              backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAA+UlEQVQ4y2OUVdL9z0ABYKJUM8xQRgYGBoZ3bz8xbFy9imHd8iUMDAwMDGfPnmVgYGBgkJJXwKqm8cIuBm1LZ7BahnfvPjEwMDAwrF+9imHVkkUMDAwMDOfOnmVgYGBgEJdRxKpp1pGdDDbuARQ7ioGBgeHPnz8MDAwMDNKKGljVNF/YycBu6cbwl4GBgYGBgYEB7EBJeSWsmuYe2cXAauQIV8TAwMDw4+NbBgYGBgZ55XysmtYf28nAoO/KwMzMxMDAwMAADjRZJW2smlYc3MkgpGPPwMTEyMDAwMAAjjlpRS2smlYd3skgpevIwMjICHcUw/PbFxjJ9iHFgAFvPF4DF9AccQAAAABJRU5ErkJggg==')",
              backgroundRepeat: "repeat"
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
                      ? "bg-green-100 text-slate-800 rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none"
                  )}
                >
                  {message.content}
                  <div className="text-[10px] text-gray-500 text-right mt-1 mr-1">
                    {message.timestamp}
                    {message.role === 'user' && (
                      <span className="ml-1 text-green-600">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 bg-white rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* WhatsApp-style input area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2 flex gap-2 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                <Paperclip size={18} />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                <FileImage size={18} />
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="resize-none min-h-[40px] max-h-[80px] text-sm py-2 rounded-2xl bg-white border-gray-200 text-gray-700 focus-visible:ring-green-500/40"
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
              className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-sm flex-shrink-0"
            >
              {isLoading ? (
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
