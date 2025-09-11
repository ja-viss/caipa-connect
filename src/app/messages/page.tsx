import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Search } from "lucide-react";
import { getConversations } from "@/lib/actions/students";
import type { Conversation } from "@/lib/types";

export default async function MessagesPage() {
  const conversations: Conversation[] = await getConversations();
  
  if (conversations.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>No se encontraron conversaciones.</p>
        </div>
    )
  }

  const selectedConversation = conversations[0];

  return (
    <div className="h-[calc(100vh-10rem)]">
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
      <Card className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversaciones..." className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${
                  convo.id === selectedConversation.id ? 'bg-muted' : ''
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={convo.contactAvatar.imageUrl} alt={convo.contactName} data-ai-hint={convo.contactAvatar.imageHint} />
                  <AvatarFallback>{convo.contactName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{convo.contactName}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessagePreview}</p>
                </div>
                <span className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.contactAvatar.imageUrl} alt={selectedConversation.contactName} data-ai-hint={selectedConversation.contactAvatar.imageHint} />
            <AvatarFallback>{selectedConversation.contactName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{selectedConversation.contactName}</h2>
        </div>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'contact' && (
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.contactAvatar.imageUrl} alt={selectedConversation.contactName} data-ai-hint={selectedConversation.contactAvatar.imageHint} />
                    <AvatarFallback>{selectedConversation.contactName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                    <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                    >
                    <p>{message.text}</p>
                    </div>
                     <p className={`text-xs text-muted-foreground mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.timestamp}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="relative">
            <Input placeholder="Escribe tu mensaje..." className="pr-12" />
            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </div>
  );
}
