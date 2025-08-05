
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin, Trash2, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Champion } from "@/api/entities";

function getTimeStatus(champion) {
  if (champion.last_checked) {
    return `Checked ${formatDistanceToNowStrict(new Date(champion.last_checked))} ago`;
  }
  return "Never checked";
}

const getFullName = (champ) => champ.first_name && champ.last_name ? `${champ.first_name} ${champ.last_name}` : champ.name || "Champion";
const getInitials = (champ) => {
    if (champ.first_name && champ.last_name) return `${champ.first_name.charAt(0)}${champ.last_name.charAt(0)}`;
    if (champ.name) {
        const parts = champ.name.split(' ');
        return parts.length > 1 ? `${parts[0].charAt(0)}${parts[1].charAt(0)}` : parts[0].charAt(0);
    }
    return "C";
};

export default function ChampionListItem({ champion, isNew, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const timeStatus = getTimeStatus(champion);
  const championFullName = getFullName(champion);
  const championInitials = getInitials(champion);
  const currentPosition = champion.current_title && champion.current_company
    ? `${champion.current_title} at ${champion.current_company}`
    : champion.current_title || champion.current_company || "Position not available";

  const itemStyle = isNew
    ? "bg-gradient-to-r from-blue-500/10 to-gray-900/10 border-blue-500/30 ring-1 ring-inset ring-blue-500/20"
    : "bg-gray-900/80 border-gray-800";
    
  const nameColor = isNew ? "text-white" : "text-gray-200";
  const positionColor = isNew ? "text-blue-300" : "text-gray-400";
  const avatarBorderColor = isNew ? "border-blue-500/50" : "border-gray-700";

  const handleDeleteChampion = async () => {
    setIsDeleting(true);
    try {
      await Champion.delete(champion.id);
      toast({
        title: "Champion Removed",
        description: `${championFullName} is no longer being tracked.`,
      });
      if (onDeleteSuccess) onDeleteSuccess(champion.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting",
        description: error.message || "Could not delete the champion.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-700 ${itemStyle}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className={`w-11 h-11 border-2 ${avatarBorderColor}`}>
          <AvatarImage src={champion.profile_picture_url || undefined} alt={championFullName} />
          <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white font-medium">{championInitials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl(`ChampionProfile?championId=${champion.id}`)} className="group">
            <h3 className={`text-md leading-tight truncate font-medium group-hover:underline ${nameColor}`}>
              {isNew && <Zap className="w-4 h-4 inline mr-2 text-yellow-400" />}
              {championFullName}
            </h3>
          </Link>
          <p className={`text-sm truncate ${positionColor}`} title={currentPosition}>
            {currentPosition}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-xs text-gray-500 hidden sm:block">{timeStatus}</p>
        
        <Button
          size="sm"
          variant="outline"
          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          onClick={() => window.open(champion.linkedin_url, "_blank")}
        >
          <Linkedin className="w-3.5 h-3.5 mr-2" /> LinkedIn
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 w-8 h-8">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This will permanently remove <strong>{championFullName}</strong>. You will no longer receive alerts for this person.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-gray-600 hover:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChampion}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
