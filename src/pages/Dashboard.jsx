
import React, { useState, useEffect } from "react";
import { Champion } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Zap, TrendingUp, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import ChampionListItem from "../components/dashboard/ChampionListItem";
import JobChangeAlert from "../components/dashboard/JobChangeAlert"; // New import
import { AtmosphericCard, AtmosphericCardHeader, AtmosphericCardTitle, AtmosphericCardContent } from "@/components/ui/atmospheric-card";
import { LogoIcon } from "@/components/ui/logo";

export default function Dashboard() {
  const [allChampions, setAllChampions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [jobChangeChampions, setJobChangeChampions] = useState([]); // New state
  const [isAlertOpen, setIsAlertOpen] = useState(false); // New state

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setIsLoadingPage(true);
      try {
        const userData = await User.me();
        setCurrentUser(userData);
        
        const championsData = await Champion.filter({ created_by: userData.email }, "-change_detected_at");
        setAllChampions(championsData || []);

        const newChanges = (championsData || []).filter(c => c.job_change_status === 'new_change_detected');
        if (newChanges.length > 0) {
          setJobChangeChampions(newChanges);
          setIsAlertOpen(true);
        }

      } catch (error) {
        console.error("Dashboard: Error loading data:", error);
        window.location.href = createPageUrl("Landing?reason=auth_required");
        return;
      } finally {
        setIsLoadingPage(false);
      }
    };
    checkAuthAndLoadData();
  }, []);
  
  const handleAlertClose = async () => {
    if (jobChangeChampions.length === 0) {
      setIsAlertOpen(false);
      return;
    }

    const updatePromises = jobChangeChampions.map(champion =>
      Champion.update(champion.id, {
        job_change_status: 'changed',
        notified_at: new Date().toISOString()
      })
    );
    await Promise.all(updatePromises);
    
    // Update local state to reflect that the notification has been seen
    const updatedIds = new Set(jobChangeChampions.map(c => c.id));
    setAllChampions(prev => prev.map(c => 
      updatedIds.has(c.id) ? { ...c, job_change_status: 'changed' } : c
    ));

    setIsAlertOpen(false);
    setJobChangeChampions([]);
  };

  const handleChampionDeleted = (deletedChampionId) => {
    setAllChampions(prevChampions => prevChampions.filter(c => c.id !== deletedChampionId));
  };

  const recentJobChangeChampions = allChampions.filter(c => c.is_recent_job_change) || [];
  const otherChampions = allChampions.filter(c => !c.is_recent_job_change) || [];
  const recentChangesCount = recentJobChangeChampions.length;

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
          <div className="absolute inset-0 rounded-full coral-teal-gradient-subtle blur-xl"></div>
        </div>
      </div>
    );
  }
  
  if (!allChampions || allChampions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-16">
        <Toaster />
        <AtmosphericCard variant="premium" className="p-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 coral-teal-gradient-subtle blur-3xl"></div>
            <div className="relative inline-block p-4 bg-gradient-to-br from-slate-900 to-black/50 rounded-full backdrop-blur-sm border border-slate-700/50">
                <LogoIcon className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome to Championss!</h1>
          <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
            Track your key contacts and get instant alerts when they move companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("AddChampion")}>
              <Button size="lg" className="coral-teal-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 w-full sm:w-auto">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Champion
              </Button>
            </Link>
            <Link to={createPageUrl("BulkUpload")}>
              <Button variant="outline" size="lg" className="bg-white/5 border-orange-400/30 text-orange-300 hover:bg-orange-500/10 w-full sm:w-auto transition-all duration-200">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </Link>
          </div>
        </AtmosphericCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Toaster />
      <JobChangeAlert 
        champions={jobChangeChampions}
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -inset-2 coral-teal-gradient-subtle blur-xl"></div>
          <h2 className="relative text-white text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Champion Updates
          </h2>
        </div>
        <Link to={createPageUrl("AddChampion")}>
          <Button className="coral-teal-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Add Champion
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {recentJobChangeChampions.length > 0 && (
          <section>
            <AtmosphericCard variant="premium" className="mb-4">
              <AtmosphericCardHeader className="pb-4">
                <AtmosphericCardTitle className="flex items-center text-xl">
                  <div className="p-2 coral-teal-gradient-subtle rounded-full mr-3 backdrop-blur-sm border border-orange-500/30">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  Recent Job Changes
                  <Badge variant="secondary" className="ml-3 coral-teal-gradient-subtle text-orange-300 border border-orange-400/30 backdrop-blur-sm">
                    {recentChangesCount}
                  </Badge>
                </AtmosphericCardTitle>
              </AtmosphericCardHeader>
              <AtmosphericCardContent>
                <div className="space-y-3">
                  {recentJobChangeChampions.map((champion) => (
                    <ChampionListItem
                      key={champion.id}
                      champion={champion}
                      isNew={champion.job_change_status === 'new_change_detected'} // Changed logic
                      onDeleteSuccess={handleChampionDeleted}
                    />
                  ))}
                </div>
              </AtmosphericCardContent>
            </AtmosphericCard>
          </section>
        )}

        {otherChampions.length > 0 && (
          <section>
            <AtmosphericCard variant="gradient">
              <AtmosphericCardHeader className="pb-4">
                <AtmosphericCardTitle className="flex items-center text-xl">
                  <div className="p-2 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-full mr-3 backdrop-blur-sm border border-gray-500/30">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  All Champions
                  <Badge variant="secondary" className="ml-3 bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-400/30 backdrop-blur-sm">
                    {otherChampions.length}
                  </Badge>
                </AtmosphericCardTitle>
              </AtmosphericCardHeader>
              <AtmosphericCardContent>
                <div className="space-y-3">
                  {otherChampions.map((champion) => (
                    <ChampionListItem
                      key={champion.id}
                      champion={champion}
                      isNew={false}
                      onDeleteSuccess={handleChampionDeleted}
                    />
                  ))}
                </div>
              </AtmosphericCardContent>
            </AtmosphericCard>
          </section>
        )}
      </div>
    </div>
  );
}
