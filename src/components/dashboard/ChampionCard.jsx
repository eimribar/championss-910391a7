
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Trash2, AlertTriangle, UserCircle } from "lucide-react"; // Added UserCircle
import { format, formatDistanceToNowStrict, differenceInDays, differenceInWeeks } from "date-fns";
import { Champion } from "@/api/entities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added Avatar components
import { Link } from "react-router-dom"; // Added Link
import { createPageUrl } from "@/utils"; // Added createPageUrl

// Helper to get "X days/weeks ago" string or "Last checked X days/weeks ago"
function getTimeStatus(champion) {
  const now = new Date();
  if (champion.status === "changed" && champion.change_detected_at) {
    const changeDate = new Date(champion.change_detected_at);
    const days = differenceInDays(now, changeDate);
    if (days === 0) return "Changed today";
    if (days === 1) return "Changed 1 day ago";
    if (days < 7) return `Changed ${days} days ago`;
    const weeks = differenceInWeeks(now, changeDate);
    if (weeks === 1) return "Changed 1 week ago";
    return `Changed ${weeks} weeks ago`;
  }
  if (champion.last_checked) {
    const checkDate = new Date(champion.last_checked);
    const days = differenceInDays(now, checkDate);
    if (days === 0) return "Last checked today";
    if (days === 1) return "Last checked 1 day ago";
    if (days < 7) return `Last checked ${days} days ago`;
    const weeks = differenceInWeeks(now, checkDate);
    if (weeks === 1) return "Last checked 1 week ago";
    return `Last checked ${weeks} weeks ago`;
  }
  return "Status unknown";
}

const getFullNameForCard = (champ) => {
    if (champ.first_name && champ.last_name) {
        return `${champ.first_name} ${champ.last_name}`;
    }
    return champ.name || "Champion";
}


export default function ChampionCard({ champion, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fix: Check for job changes including new champions with recent starts
  const hasJobChange = champion.status === "changed" || 
                      (champion.recently_started_job && champion.years_in_company < 0.25) ||
                      (champion.job_change_status === "recently_changed_job");
                      
  const timeStatus = getTimeStatus(champion);
  const championFullName = getFullNameForCard(champion);

  const handleDeleteChampion = async () => {
    setIsDeleting(true);
    try {
      await Champion.delete(champion.id);
      toast({
        title: "Champion Deleted",
        description: `${championFullName} has been removed successfully.`,
      });
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting champion:", error);
      toast({
        variant: "destructive",
        title: "Error Deleting Champion",
        description: error.message || "Could not delete the champion.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
           <Link to={createPageUrl(`ChampionProfile?championId=${champion.id}`)} className="flex items-center space-x-3 group">
            <Avatar className="w-12 h-12 border-2 group-hover:border-blue-500 transition-colors">
              <AvatarImage src={champion.profile_picture_url || undefined} alt={championFullName} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                {champion.first_name?.charAt(0) || champion.name?.charAt(0) || "C"}
                {champion.last_name?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-slate-900 text-base font-semibold leading-tight group-hover:text-blue-600 transition-colors truncate" title={championFullName}>
                {championFullName}
              </h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {timeStatus}
              </p>
            </div>
          </Link>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 shrink-0"
                title="Delete Champion"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <strong>{championFullName}</strong> and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteChampion}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {hasJobChange ? (
          <>
            {champion.recently_started_job ? (
              // Show for new champions who recently started
              <>
                <div className="flex items-center mb-2">
                  <Badge variant="destructive" className="bg-orange-500 text-white text-xs">
                    🎯 New Job Alert
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm mb-0.5 truncate" title={champion.current_title}>
                  <span className="text-orange-600 font-semibold">{champion.current_title || "N/A"}</span>
                </p>
                <p className="text-slate-600 text-sm truncate" title={champion.current_company}>
                  <span className="text-orange-600 font-semibold">{champion.current_company || "N/A"}</span>
                  <span className="text-xs text-orange-500 ml-2">
                    Started {Math.round(champion.years_in_company * 12)} months ago
                  </span>
                </p>
              </>
            ) : (
              // Show for existing champions who changed jobs
              <>
                <p className="text-slate-600 text-sm mb-0.5 truncate" title={`${champion.previous_title} → ${champion.current_title}`}>
                  {champion.previous_title || "N/A"} → <span className="text-blue-600 font-semibold">{champion.current_title || "N/A"}</span>
                </p>
                <p className="text-slate-600 text-sm truncate" title={`${champion.previous_company} → ${champion.current_company}`}>
                  {champion.previous_company || "N/A"} → <span className="text-blue-600 font-semibold">{champion.current_company || "N/A"}</span>
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-slate-600 text-sm mb-0.5 truncate" title={champion.current_title}>
              {champion.current_title || "Title not specified"}
            </p>
            <p className="text-slate-600 text-sm flex items-center">
              <span className="truncate" title={champion.current_company}>{champion.current_company || "Company not specified"}</span>
              <Badge variant="secondary" className="ml-2 whitespace-nowrap">No changes</Badge>
            </p>
          </>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 text-xs"
          onClick={() => window.open(champion.linkedin_url, "_blank")}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> LinkedIn
        </Button>
        <Link to={createPageUrl(`ChampionProfile?championId=${champion.id}`)} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 text-xs"
          >
            <UserCircle className="w-3.5 h-3.5 mr-1.5" /> View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
