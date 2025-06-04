
"use client";

import { useState, useRef, useEffect, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, CornerDownLeft } from 'lucide-react';
import { chatWithSupport, type ChatWithSupportInput, type ChatWithSupportOutput } from '@/ai/flows/customer-support-chat-flow';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface WidgetPosition {
  top: string | number;
  left: string | number;
  bottom: string | number;
  right: string | number;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial-greeting', role: 'model', content: "Hello! How can I help you with CommerceZen today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [widgetPosition, setWidgetPosition] = useState<WidgetPosition>({
    top: 'auto',
    left: 'auto',
    bottom: '1.5rem', // 24px
    right: '1.5rem',  // 24px
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggableRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!draggableRef.current) return;
    event.preventDefault(); // Prevent text selection during drag
    const rect = draggableRef.current.getBoundingClientRect();
    
    // Switch to top/left positioning if not already
    setWidgetPosition({
      top: rect.top,
      left: rect.left,
      bottom: 'auto',
      right: 'auto',
    });

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !draggableRef.current) return;
      event.preventDefault();

      let newX = event.clientX - dragOffset.current.x;
      let newY = event.clientY - dragOffset.current.y;

      // Constrain to viewport
      const widgetWidth = draggableRef.current.offsetWidth;
      const widgetHeight = draggableRef.current.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - widgetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - widgetHeight));

      setWidgetPosition({ top: newY, left: newX, bottom: 'auto', right: 'auto' });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Apply 'grabbing' cursor to body to indicate system-wide drag operation
      document.body.style.cursor = 'grabbing'; 
    } else {
      document.body.style.cursor = ''; // Reset cursor
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = ''; // Ensure cursor is reset on cleanup
    };
  }, [isDragging]);


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    const conversationHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
    conversationHistory.push({ role: 'user', content: trimmedInput });

    try {
      const input: ChatWithSupportInput = {
        userInput: trimmedInput,
        conversationHistory: conversationHistory.slice(-10), 
      };
      const result: ChatWithSupportOutput = await chatWithSupport(input);
      
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: result.aiResponse,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div
        ref={draggableRef}
        style={{
          position: 'fixed',
          top: widgetPosition.top,
          left: widgetPosition.left,
          bottom: widgetPosition.bottom,
          right: widgetPosition.right,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 50,
        }}
        className="h-14 w-14 rounded-full shadow-lg animate-subtle-scale-up flex items-center justify-center bg-accent hover:bg-accent/90"
        onMouseDown={handleMouseDown}
      >
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="w-full h-full rounded-full bg-transparent hover:bg-transparent text-accent-foreground p-0"
            aria-label="Open Chat"
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent 
        side="top" 
        align="end" 
        className="w-[350px] h-[500px] p-0 flex flex-col rounded-lg shadow-xl border-border mr-2 mb-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Prevent closing popover on drag if desired, but usually not necessary if drag target is trigger itself.
        // onInteractOutside={(e) => { if (isDragging) e.preventDefault(); }} 
        >
        <header className="p-4 border-b bg-card rounded-t-lg">
          <h3 className="font-headline text-lg text-primary">CommerceZen Support</h3>
        </header>
        
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 bg-background">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                  msg.role === 'user'
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {msg.content}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-center justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t bg-card rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow h-10 focus-visible:ring-accent"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 w-10" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
           <p className="text-xs text-muted-foreground/70 mt-1.5 text-center flex items-center justify-center">
            Press <CornerDownLeft className="h-3 w-3 mx-1" /> to send. Shift + <CornerDownLeft className="h-3 w-3 mx-1" /> for new line.
          </p>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

