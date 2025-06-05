
"use client";

import { useState, useRef, useEffect, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, CornerDownLeft, GripVertical } from 'lucide-react';
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

const MIN_CHAT_WIDTH = 280;
const MIN_CHAT_HEIGHT = 300;
const MAX_CHAT_WIDTH_PERCENT = 0.9; 
const MAX_CHAT_HEIGHT_PERCENT = 0.85; 
const INITIAL_CHAT_WIDTH = 350;
const INITIAL_CHAT_HEIGHT = 500;


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
    bottom: '1.5rem', 
    right: '1.5rem',  
  });
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggableRef = useRef<HTMLDivElement>(null);

  const [chatWindowSize, setChatWindowSize] = useState({ width: INITIAL_CHAT_WIDTH, height: INITIAL_CHAT_HEIGHT });
  const [isResizing, setIsResizing] = useState(false);
  const initialResizeState = useRef<{ startX: number; startY: number; initialWidth: number; initialHeight: number } | null>(null);

  const handleWidgetMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!draggableRef.current || (event.target as HTMLElement).closest('.resize-handle')) return; 
    event.preventDefault(); 
    const rect = draggableRef.current.getBoundingClientRect();
    
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
    setIsDraggingWidget(true);
  };

  useEffect(() => {
    const handleWidgetMouseMove = (event: MouseEvent) => {
      if (!isDraggingWidget || !draggableRef.current) return;
      event.preventDefault();

      let newX = event.clientX - dragOffset.current.x;
      let newY = event.clientY - dragOffset.current.y;

      const widgetWidth = draggableRef.current.offsetWidth;
      const widgetHeight = draggableRef.current.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - widgetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - widgetHeight));

      setWidgetPosition({ top: newY, left: newX, bottom: 'auto', right: 'auto' });
    };

    const handleWidgetMouseUp = () => {
      setIsDraggingWidget(false);
      if (document.body) {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isDraggingWidget) {
      document.addEventListener('mousemove', handleWidgetMouseMove);
      document.addEventListener('mouseup', handleWidgetMouseUp);
      if (document.body) {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleWidgetMouseMove);
      document.removeEventListener('mouseup', handleWidgetMouseUp);
      if (document.body) { // Check if body exists during cleanup
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, [isDraggingWidget]);


  const handleResizeMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    setIsResizing(true);
    initialResizeState.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialWidth: chatWindowSize.width,
      initialHeight: chatWindowSize.height,
    };
  };

  useEffect(() => {
    const handleResizeMouseMove = (event: MouseEvent) => {
      if (!isResizing || !initialResizeState.current) return;

      const { startX, startY, initialWidth, initialHeight } = initialResizeState.current;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      let newWidth = initialWidth + dx;
      let newHeight = initialHeight + dy;
      
      const maxWidth = window.innerWidth * MAX_CHAT_WIDTH_PERCENT;
      const maxHeight = window.innerHeight * MAX_CHAT_HEIGHT_PERCENT;

      newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(newWidth, maxWidth));
      newHeight = Math.max(MIN_CHAT_HEIGHT, Math.min(newHeight, maxHeight));
      
      setChatWindowSize({ width: newWidth, height: newHeight });
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
      initialResizeState.current = null;
      if (document.body && !isDraggingWidget) { // Only reset if not also dragging
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      if (document.body) {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      if (document.body && !isDraggingWidget) { // Check if body exists during cleanup
         document.body.style.userSelect = '';
         document.body.style.cursor = ''; 
      }
    };
  }, [isResizing, isDraggingWidget]);


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
  }, [messages, chatWindowSize]);

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

    const conversationHistoryForAI = messages.map(msg => ({ role: msg.role, content: msg.content }));
    const currentTurnHistory = [...conversationHistoryForAI, { role: 'user' as const, content: trimmedInput }];


    try {
      const input: ChatWithSupportInput = {
        userInput: trimmedInput,
        conversationHistory: currentTurnHistory.slice(-10), 
      };
      const result: ChatWithSupportOutput = await chatWithSupport(input);
      
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: result.aiResponse,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      // console.error("Error calling chat flow:", error);
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
          cursor: isDraggingWidget ? 'grabbing' : 'grab',
          zIndex: 50,
        }}
        className="h-14 w-14 rounded-full shadow-lg animate-subtle-scale-up flex items-center justify-center bg-accent hover:bg-accent/90"
        onMouseDown={handleWidgetMouseDown}
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
        className={cn(
            "p-0 flex flex-col rounded-lg border-border mr-2 mb-1 overflow-hidden transition-shadow duration-200",
            isResizing ? "cursor-nwse-resize ring-2 ring-accent shadow-2xl" : "shadow-xl"
        )}
        style={{
            width: `${chatWindowSize.width}px`,
            height: `${chatWindowSize.height}px`,
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => { 
            if ((e.target as HTMLElement)?.closest('.resize-handle')) {
                e.preventDefault();
            }
        }}
        >
        <header className="p-4 border-b bg-card rounded-t-lg cursor-default">
          <h3 className="font-headline text-lg text-primary">CommerceZen Support</h3>
        </header>
        
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 bg-background">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm break-words animate-subtle-fade-in",
                  msg.role === 'user'
                    ? "ml-auto bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground" 
                )}
              >
                {msg.content}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-center justify-start animate-subtle-fade-in">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t bg-card rounded-b-lg relative">
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
           <div className="flex justify-between items-end mt-1.5">
            <p className="text-xs text-muted-foreground/70 flex items-center">
              Press <CornerDownLeft className="h-3 w-3 mx-1" /> to send. Shift + <CornerDownLeft className="h-3 w-3 mx-1" /> for new line.
            </p>
            <div
              onMouseDown={handleResizeMouseDown}
              className="resize-handle w-5 h-5 flex items-center justify-center cursor-nwse-resize text-muted-foreground hover:text-foreground"
              title="Resize chat"
            >
              <GripVertical size={16} className="transform rotate-45" />
            </div>
          </div>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
