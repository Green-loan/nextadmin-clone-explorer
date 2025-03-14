
import { useState, useRef, useEffect } from 'react';
import { Bot, SendIcon, X } from 'lucide-react';
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
      // Simulate AI response with sample responses about finance
      setTimeout(() => {
        const responses = [
          "Based on your loan history, I recommend considering a green energy loan for solar panels. They typically have lower interest rates and could reduce your operating costs.",
          "Looking at the current market trends, green finance investments are showing promising growth. Would you like me to provide more specific data?",
          "Your current loan portfolio shows a healthy distribution. To optimize further, consider refinancing your highest interest loans first.",
          "I've analyzed your cash flow patterns. You might benefit from our flexible payment schedules for agricultural green loans.",
          "Green Finance offers competitive rates for sustainable business projects. The average APR is currently 5.2% for qualified borrowers.",
        ];
        
        const aiResponse: Message = { 
          role: 'assistant', 
          content: responses[Math.floor(Math.random() * responses.length)]
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
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
        className="fixed bottom-6 right-6 p-4 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>

      {/* AI Assistant Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="text-green-600" size={20} />
              Green Finance AI
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    "max-w-[80%] p-3",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about loans, financial advice, etc..."
              className="resize-none"
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
              className="h-full aspect-square bg-green-600 hover:bg-green-700"
            >
              <SendIcon size={18} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
