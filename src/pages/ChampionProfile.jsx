import React, { useState, useEffect } from "react";
import { Champion } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Linkedin, Briefcase, Building, CalendarDays, Clock, CheckCircle, AlertTriangle, Info, Zap, Users, ExternalLink, Star, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNowStrict, differenceInMonths } from "date-fns";
import { Link } from "react-router-dom";
import { AtmosphericCard, AtmosphericCardHeader, AtmosphericCardTitle, AtmosphericCardContent } from "@/components/ui/atmospheric-card";

// Helper to extract company name from subtitle (e.g., "Creyos · Permanent Full-time")
const getCompanyNameFromSubtitle = (subtitle) => {
  if (!subtitle) return "N/A";
  return subtitle.split('·')[0]?.trim() || "N/A";
};

export default function ChampionProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const championId = urlParams.get('championId');

  const [champion, setChampion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChampionData = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!championId) {
        setError("No Champion ID provided in URL.");
        setIsLoading(false);
        return;
      }

      try {
        const user = await User.me();
        
        const champions = await Champion.filter({ 
          id: championId, 
          created_by: user.email
        });
        
        if (champions && champions.length > 0) {
          setChampion(champions[0]);
        } else {
          setError("Champion not found or access denied.");
        }
      } catch (err) {
        console.error("Error fetching champion data:", err);
        if (err.message.includes("Unauthorized") || err.status === 401) {
            window.location.href = createPageUrl("Landing?reason=auth_required");
        } else {
            setError("Failed to load champion data. " + (err.message || ""));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampionData();
  }, [championId]);

  const getJobChangeStatusBadge = (jobStatus, isRecent, isPositionChangeOnly) => {
    if (isRecent) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse border-green-400/30 backdrop-blur-sm">
          <Zap className="w-3 h-3 mr-1" /> Recent Change!
        </Badge>
      );
    }
    if (isPositionChangeOnly && jobStatus !== "no_change") {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400/30 backdrop-blur-sm">
          <Star className="w-3 h-3 mr-1" /> Position Change
        </Badge>
      );
    }
    switch (jobStatus) {
      case "new_change_detected":
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400/30 backdrop-blur-sm">
            <AlertTriangle className="w-3 h-3 mr-1" />New Change Detected
          </Badge>
        );
      case "changed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/30 backdrop-blur-sm">
            <AlertTriangle className="w-3 h-3 mr-1" />Job Changed
          </Badge>
        );
      case "position_change":
         return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400/30 backdrop-blur-sm">
            <Star className="w-3 h-3 mr-1" />Position Change
          </Badge>
        );
      case "no_change":
      default:
        return null;
    }
  };
  
  const getFullName = (champ) => {
    if (champ.first_name && champ.last_name) {
        return `${champ.first_name} ${champ.last_name}`;
    }
    return champ.name || "N/A";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <AtmosphericCard variant="default" className="p-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-white/5 border-gray-600/50 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </AtmosphericCard>
      </div>
    );
  }

  if (!champion) {
    return (
      <div className="text-center py-10 text-gray-400">
        <AtmosphericCard variant="default" className="p-8 max-w-md mx-auto">
          Champion data not available.
        </AtmosphericCard>
      </div>
    );
  }
  
  const primaryProfilePic = champion.profile_picture_url || champion.profile_picture_url_low;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to={createPageUrl("Dashboard")} className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Section */}
      <AtmosphericCard variant="premium" className="overflow-hidden mb-8">
        <div className="relative">
          {/* Gradient Header */}
          <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-500/80 via-purple-600/70 to-indigo-600/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start -mt-20 sm:-mt-24">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-gray-800/50 shadow-2xl shrink-0 backdrop-blur-sm">
                <AvatarImage src={primaryProfilePic || undefined} alt={getFullName(champion)} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-gray-700 to-gray-800 text-white">
                  {champion.first_name?.charAt(0) || champion.name?.charAt(0) || "C"}
                  {champion.last_name?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-grow">
                <div className="sm:pt-24">
                  <h1 className="text-3xl font-bold text-white mb-2">{getFullName(champion)}</h1>
                  <p className="text-lg text-gray-300 mb-1">{champion.current_title || "Title not specified"}</p>
                  <p className="text-md text-gray-400 mb-2">{champion.current_company || "Company not specified"}</p>
                  
                  {champion.time_in_current_role && (
                    <p className="text-sm text-gray-400 mb-3 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      In current role for {champion.time_in_current_role}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {getJobChangeStatusBadge(champion.job_change_status, champion.is_recent_job_change, champion.is_position_change_only)}
                    <a
                      href={champion.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 mr-1" /> LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AtmosphericCard>

      {/* About Section */}
      {champion.about && (
        <AtmosphericCard variant="gradient" className="mb-8">
          <AtmosphericCardHeader>
            <AtmosphericCardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400"/> 
              About
            </AtmosphericCardTitle>
          </AtmosphericCardHeader>
          <AtmosphericCardContent>
            <p className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">{champion.about}</p>
          </AtmosphericCardContent>
        </AtmosphericCard>
      )}

      {/* Experience Section */}
      {(champion.linkedin_experiences && champion.linkedin_experiences.length > 0) && (
        <AtmosphericCard variant="glow" className="mb-8">
          <AtmosphericCardHeader>
            <AtmosphericCardTitle className="text-2xl flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-blue-400"/> 
              Experience
            </AtmosphericCardTitle>
          </AtmosphericCardHeader>
          <AtmosphericCardContent>
            <div className="space-y-6">
              {champion.linkedin_experiences.map((exp, index) => (
                <div key={index} className="flex items-start space-x-4 p-5 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-900/70 transition-all duration-200">
                  {exp.logo && (
                    <Avatar className="w-12 h-12 rounded-md border border-gray-600/50 shrink-0">
                      <AvatarImage src={exp.logo} alt={`${getCompanyNameFromSubtitle(exp.subtitle)} logo`} />
                      <AvatarFallback className="bg-gray-700/50 rounded-md text-gray-300">
                        {getCompanyNameFromSubtitle(exp.subtitle)?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-grow">
                    <h3 className="text-md font-semibold text-white mb-1">{exp.title}</h3>
                    <p className="text-sm text-gray-300 mb-1">{exp.subtitle || getCompanyNameFromSubtitle(exp.subtitle)}</p>
                    <p className="text-xs text-gray-400 mb-1">{exp.caption}</p>
                    <p className="text-xs text-gray-500">{exp.metadata}</p>
                    {exp.companyLink1 && (
                       <a href={exp.companyLink1} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center transition-colors">
                         View Company <ExternalLink className="w-3 h-3 ml-1"/>
                       </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AtmosphericCardContent>
        </AtmosphericCard>
      )}

      {/* Role Summary & Monitoring Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {champion.current_company && (
          <AtmosphericCard variant="default">
            <AtmosphericCardHeader>
              <AtmosphericCardTitle className="text-lg flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-400"/> 
                Current Role
              </AtmosphericCardTitle>
            </AtmosphericCardHeader>
            <AtmosphericCardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Title:</span>
                <span className="text-white">{champion.current_title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Company:</span>
                <span className="text-white">{champion.current_company || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Duration:</span>
                <span className="text-white">{champion.time_in_current_role || (champion.months_in_current_role ? `${champion.months_in_current_role} months` : "N/A")}</span>
              </div>
            </AtmosphericCardContent>
          </AtmosphericCard>
        )}

        {champion.previous_company && (
           <AtmosphericCard variant="default">
            <AtmosphericCardHeader>
              <AtmosphericCardTitle className="text-lg flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-500"/> 
                Previous Role
              </AtmosphericCardTitle>
            </AtmosphericCardHeader>
            <AtmosphericCardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Title:</span>
                <span className="text-white">{champion.previous_title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Company:</span>
                <span className="text-white">{champion.previous_company || "N/A"}</span>
              </div>
            </AtmosphericCardContent>
          </AtmosphericCard>
        )}
      </div>

      {/* Monitoring Details */}
      <AtmosphericCard variant="premium" className="mb-8">
        <AtmosphericCardHeader>
          <AtmosphericCardTitle className="text-lg flex items-center">
            <Info className="w-5 h-5 mr-2 text-gray-400"/> 
            Monitoring Details
          </AtmosphericCardTitle>
        </AtmosphericCardHeader>
        <AtmosphericCardContent className="space-y-3 text-sm">
          {champion.last_checked && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-300">Last Checked:</span>
              <span className="text-white">{format(new Date(champion.last_checked), "PPPp")} ({formatDistanceToNowStrict(new Date(champion.last_checked))} ago)</span>
            </div>
          )}
          {champion.change_detected_at && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-300">Change Detected:</span>
              <span className="text-white">{format(new Date(champion.change_detected_at), "PPPp")}</span>
            </div>
          )}
          {champion.notified_at && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-300">Notified On:</span>
              <span className="text-white">{format(new Date(champion.notified_at), "PPPp")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">Overall Status:</span>
            <span className="text-white capitalize">{champion.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">Job Change Detail:</span>
            <span className="text-white">{champion.job_change_status?.replace(/_/g, ' ')}</span>
          </div>
        </AtmosphericCardContent>
      </AtmosphericCard>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">
        Champion ID: {champion.id}
      </div>
    </div>
  );
}