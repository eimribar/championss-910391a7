import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PartyPopper, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const getInitials = (champ) => {
    if (champ.first_name && champ.last_name) return `${champ.first_name.charAt(0)}${champ.last_name.charAt(0)}`;
    if (champ.name) {
        const parts = champ.name.split(' ');
        return parts.length > 1 ? `${parts[0].charAt(0)}${parts[1].charAt(0)}` : parts[0].charAt(0);
    }
    return "C";
};

export default function JobChangeAlert({ champions, isOpen, onClose }) {
  if (!champions || champions.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-950/80 border-orange-500/30 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold space-x-3">
            <div className="p-3 coral-teal-gradient rounded-full">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">New Job Changes Detected!</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 -mr-4 my-4">
            <div className="space-y-4">
            {champions.map(champion => (
                <div key={champion.id} className="p-4 rounded-lg bg-white/5 border border-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-gray-600">
                        <AvatarImage src={champion.profile_picture_url} />
                        <AvatarFallback className="bg-gray-700">{getInitials(champion)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-white">
                            {champion.first_name} {champion.last_name}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-400 mt-1 gap-2">
                           <div className="truncate">from <strong className="text-gray-300">{champion.previous_company || 'Previous Company'}</strong></div>
                           <ArrowRight className="w-4 h-4 text-orange-400 hidden sm:inline-block" />
                           <div className="truncate">to <strong className="text-teal-400">{champion.current_company || 'New Company'}</strong></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                           <p>Now: <span className="text-gray-400">{champion.current_title || 'New Role'}</span></p>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose} className="coral-teal-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
            Great, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}