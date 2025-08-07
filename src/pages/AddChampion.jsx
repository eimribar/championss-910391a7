
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Champion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonStanding, Upload, Loader2, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AddChampion() {
  const navigate = useNavigate();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        window.location.href = createPageUrl("Landing?reason=auth_required");
      }
    };
    checkAuth();
  }, []);

  const validateLinkedInUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.includes('linkedin.com') && parsedUrl.pathname.startsWith('/in/');
    } catch (e) {
      return false;
    }
  };

  const normalizeLinkedInUrl = (url) => {
    try {
      const urlObj = new URL(url.trim());
      let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
      if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch (e) {
      return url;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("User data not loaded. Please try again.");
      return;
    }
    
    if (!linkedinUrl.trim()) {
      setError("LinkedIn Profile URL is required.");
      return;
    }
    
    if (!validateLinkedInUrl(linkedinUrl)) {
      setError("Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);
      
      // Check for existing champions
      const existingChampions = await Champion.filter({ 
        linkedin_url: normalizedUrl,
        created_by: currentUser.email 
      });
      
      if (existingChampions.length > 0) {
        setError("This LinkedIn profile is already being tracked by you.");
        setIsSubmitting(false);
        return;
      }
      
      // Check subscription limits
      const { count: championsCount } = await Champion.filter({ created_by: currentUser.email }, null, 0, 0, true);
      const limit = currentUser.subscription_tier === 'free' ? 10 : (currentUser.subscription_tier === 'pro' ? 100 : Infinity);
      
      if (championsCount >= limit && currentUser.subscription_tier !== 'enterprise') {
        setError(`You have reached your limit of ${limit === Infinity ? 'unlimited' : limit} champions for the ${currentUser.subscription_tier} plan.`);
        setIsSubmitting(false);
        return;
      }

      // Create champion record
      const championData = {
        name: `New Champion - ${new Date().toLocaleTimeString()}`,
        linkedin_url: normalizedUrl,
        status: "enriching",
        last_checked: new Date().toISOString(),
        created_by: currentUser.email,
      };
      
      const createdChampion = await Champion.create(championData);
      
      // Trigger enrichment
      const { enrichChampion } = await import("@/api/functions");
      const enrichmentResponse = await enrichChampion({ 
        championId: createdChampion.id, 
        linkedinUrl: normalizedUrl, 
        name: championData.name 
      });
      
      if (!enrichmentResponse?.data?.success) {
        // If enrichment fails, clean up the champion record
        await Champion.delete(createdChampion.id);
        const errorMsg = enrichmentResponse?.data?.message || "Failed to start enrichment process.";
        setError(`${errorMsg} Please try again.`);
        setIsSubmitting(false);
        return;
      }

      // Mark onboarding as completed if needed
      if (currentUser && !currentUser.onboarding_completed) {
        await User.updateMyUserData({ onboarding_completed: true });
      }

      // Success! Show success message and redirect after a short delay
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("Failed to add champion. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="atmospheric-card p-8 sm:p-12 text-center relative">
          <div className="absolute inset-0 coral-teal-gradient-subtle rounded-xl"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 coral-teal-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Champion Added Successfully!</h2>
            <p className="text-gray-400 mb-6">
              The profile is now being enriched. You'll be redirected to the dashboard shortly.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="atmospheric-card overflow-hidden relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 coral-teal-gradient-subtle"></div>
        
        <div className="relative z-10 p-6 sm:p-8">
          <div className="relative mb-8">
            <div className="absolute -inset-2 coral-teal-gradient-subtle blur-xl"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Add Champions</h1>
              <p className="text-gray-400 text-base">Choose how you'd like to add new champions to your tracking list.</p>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-700/50 px-6 sm:px-8 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
          <nav className="flex -mb-px">
            <button className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm text-orange-400 border-orange-400 relative">
              <PersonStanding className="mr-2 w-5 h-5" />
              Single Champion
              <div className="absolute inset-0 coral-teal-gradient-subtle blur-xl opacity-50"></div>
            </button>
            <Link
              to={createPageUrl("BulkUpload")}
              className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm text-gray-400 hover:text-white hover:border-gray-500 border-transparent ml-8 transition-all duration-200 relative"
            >
              <Upload className="mr-2 w-5 h-5" />
              Bulk Upload
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
          </nav>
        </div>

        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3" htmlFor="linkedin-url">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Input
                  className="block w-full rounded-lg bg-white/5 border-gray-600/50 focus:border-orange-500/50 focus:ring-orange-500/20 text-white placeholder-gray-400 backdrop-blur-sm h-12 text-base transition-all duration-200"
                  id="linkedin-url"
                  placeholder="https://linkedin.com/in/username"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => { 
                    setLinkedinUrl(e.target.value); 
                    setError(""); 
                  }}
                  required
                  disabled={isSubmitting}
                />
                <div className="absolute inset-0 rounded-lg coral-teal-gradient-subtle opacity-0 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="atmospheric-card border-red-500/30 bg-red-500/5">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-4">
              <Button
                className="relative overflow-hidden coral-teal-gradient hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300 h-12"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> 
                    Adding Champion...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 w-5 h-5" /> 
                    Add Champion
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
