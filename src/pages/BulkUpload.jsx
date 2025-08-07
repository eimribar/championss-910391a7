
import React, { useState, useCallback, useEffect } from "react";
import { User } from "@/api/entities";
import { Champion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
// JobChangeAlert import removed as it's no longer used in this simplified flow

export default function BulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // progress state removed
  // results state removed
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // showJobAlert and jobAlertChampions states removed
  // isEnriching, enrichingChampionIds, enrichmentProgress, completedEnrichments states removed

  // New state for showing success message
  const [success, setSuccess] = useState(false);

  // Playful messages for bulk enrichment (removed as isEnriching UI is removed)
  // const playfulMessages = [...];
  // const [currentMessage, setCurrentMessage] = useState(playfulMessages[0]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await User.me(); 
        setCurrentUser(userData);
      } catch (e) {
        window.location.href = createPageUrl("Landing?reason=auth_required");
      }
    };
    checkAuth();
  }, []);

  // useEffect for cycling messages during bulk enrichment (removed)
  // useEffect(() => { ... }, [isEnriching, playfulMessages]);

  // useEffect for polling multiple champions during bulk enrichment (removed)
  // useEffect(() => { ... }, [isEnriching, enrichingChampionIds, navigate]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setError(""); 
    } else {
      setError("Invalid file type. Please upload a CSV file.");
      setFile(null); 
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(""); 
    } else {
      setError("Invalid file type. Please upload a CSV file.");
      setFile(null); 
    }
  };

  const downloadTemplate = () => {
    const csvContent = "LinkedIn URL\nhttps://www.linkedin.com/in/johndoe\nhttps://www.linkedin.com/in/janesmith";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'champion_linkedin_urls_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click(); 
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const validateLinkedInUrlInCSV = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.includes('linkedin.com') && parsedUrl.pathname.startsWith('/in/');
    } catch (e) {
      return false;
    }
  };

  const normalizeLinkedInUrlInCSV = (url) => {
    try {
        const urlObj = new URL(url.trim());
        let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        if (normalized.endsWith('/') && urlObj.pathname !== '/') {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch (e) {
        return url; 
    }
  };

  const parseCSV = (text) => {
    // Attempt to remove BOM (Byte Order Mark) if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.substring(1);
    }

    const lines = text.split(/\r\n|\n/).filter(line => line.trim());
    if (lines.length < 1) { // Allow CSV with only a header row (will result in 0 records)
        throw new Error("CSV file is empty or contains no processable lines.");
    }
    // If only one line and it's not empty, it must be the header. Let it proceed, will result in 0 records.
    if (lines.length < 2 && lines[0].trim() !== "") { 
        // This implies no data rows. Let it proceed, will result in 0 records.
    } else if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one LinkedIn URL to be useful.");
    }

    const rawHeaders = lines[0].split(',');
    const headers = rawHeaders.map(h => h.trim().replace(/^"|"$/g, '').toLowerCase()); // Trim, remove quotes, and lowercase

    const linkedinHeaderVariants = [
      'linkedin url', 
      'linkedin profile', 
      'linkedin', 
      'url', 
      'profile url', 
      'linkedinurl',
      'champion url',
      'champion',
      'champion profile'
    ];
    let linkedinHeaderFound = null;
    let linkedinIndex = -1;

    for (const variant of linkedinHeaderVariants) {
        const index = headers.indexOf(variant);
        if (index !== -1) {
            linkedinHeaderFound = variant;
            linkedinIndex = index;
            break;
        }
    }
    
    if (!linkedinHeaderFound) {
        console.error("CSV Headers found:", headers); // Log actual headers for debugging
        throw new Error(`Missing required column. Please ensure your CSV has a header like 'LinkedIn URL', 'Champion URL', 'Profile URL', or 'URL'. Found headers: ${headers.join(', ')}`);
    }
    
    const records = []; // Will be array of URLs
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length <= linkedinIndex) {
        parseErrors.push(`Row ${i + 1}: Malformed row or insufficient columns.`);
        continue;
      }
      const rawLinkedinUrl = values[linkedinIndex];

      if (!rawLinkedinUrl) {
        parseErrors.push(`Row ${i + 1}: LinkedIn URL is missing in the expected column.`);
        continue;
      }
      if (!validateLinkedInUrlInCSV(rawLinkedinUrl)) {
        parseErrors.push(`Row ${i + 1}: Invalid LinkedIn URL format (received: ${rawLinkedinUrl}).`);
        continue;
      }
      records.push(normalizeLinkedInUrlInCSV(rawLinkedinUrl));
    }

    if (parseErrors.length > 0) {
        // Simplified error handling, no longer checking for "Missing required column" specifically
        const newErrorMsg = `CSV Parsing Issues:\n${parseErrors.slice(0,5).join('\n')}${parseErrors.length > 5 ? '\n...and ' + (parseErrors.length - 5) + ' more.' : ''}`;
        setError(newErrorMsg);
    }
    
    // If headers were found, but no valid records, parseErrors might be empty.
    // Add a specific check here.
    if (linkedinHeaderFound && records.length === 0 && lines.length > 1 && parseErrors.length === 0) {
        throw new Error("Found a valid header, but no processable LinkedIn URLs in subsequent rows.");
    }

    return records; // Returns an array of validated & normalized LinkedIn URLs
  };

  const processFile = async () => {
    if (!file || !currentUser) return;
    
    setError(""); 
    // setResults(null); // results state removed
    setSuccess(false); // Reset success state
    
    // isProcessing for the CSV parsing and initial looping, then isEnriching takes over visual
    setIsProcessing(true); 
    // setProgress(0); // progress state removed

    let parsedUrls;
    try {
      const text = await file.text();
      parsedUrls = parseCSV(text); 
      
      // If parseCSV itself set an error and returned no URLs, respect that.
      // If parseCSV returned no URLs but didn't throw an error (e.g., only header or empty rows after header)
      if (parsedUrls.length === 0) { 
        setError("No valid LinkedIn URLs found in the CSV file after parsing.");
        setIsProcessing(false);
        return;
      }

    } catch (parseError) {
        setError(parseError.message || "Failed to parse CSV file.");
        setIsProcessing(false);
        return;
    }
      
    // initiatedSuccessfully, creationErrors, enrichmentInitiationFailures removed

    const totalToProcess = parsedUrls.length;
    const { count: initialChampionsCount } = await Champion.filter({ created_by: currentUser.email }, null, 0, 0, true);
    const limit = currentUser.subscription_tier === 'free' ? 10 : (currentUser.subscription_tier === 'pro' ? 100 : Infinity);
    let championsCanAdd = limit === Infinity ? Infinity : limit - initialChampionsCount;
    const championsToEnrich = []; // Store champions to send to N8N in batch

    // First pass: Create all champion records
    for (let i = 0; i < totalToProcess; i++) {
      const url = parsedUrls[i];
      // setProgress(Math.round(((i + 1) / totalToProcess) * 100)); // Progress for parsing/initial loop (removed)

      if (championsCanAdd <= 0 && currentUser.subscription_tier !== 'enterprise') {
          setError(prevError => prevError ? `${prevError}\nProcessing stopped. You have reached your champion limit of ${limit}.` : `Processing stopped. You have reached your champion limit of ${limit}.`);
          // creationErrors += (totalToProcess - i); // Removed
          break; 
      }

      try {
        const existingChampions = await Champion.filter({ 
          linkedin_url: url,
          created_by: currentUser.email 
        });
        if (existingChampions.length > 0) {
          continue; // Skip if already exists
        }

        const placeholderName = `Bulk Add - ${new Date().getTime() + i}`;
        const championToCreate = {
          name: placeholderName,
          linkedin_url: url,
          status: "monitoring", // Status will be updated by enrichChampion N8N function
          last_checked: new Date().toISOString(),
          created_by: currentUser.email,
        };
        
        const createdChampion = await Champion.create(championToCreate);
        championsCanAdd--;
        
        // Add to batch for N8N
        championsToEnrich.push({
          championId: createdChampion.id,
          linkedinUrl: createdChampion.linkedin_url,
          name: createdChampion.name
        });
        
        // setEnrichingChampionIds removed

      } catch (processError) {
        console.error(`BulkUpload: Error processing URL ${url} (index ${i}):`, processError);
        let errorDetail = processError.message || "An unexpected error occurred.";
        setError(prevError => prevError ? `${prevError}\n${url}: ${errorDetail}` : `${url}: ${errorDetail}`);
        // creationErrors++; // Removed
      }
       
       if (i % 3 === 0 || i === totalToProcess - 1) {
           await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
       }
    }
    
    // setIsProcessing(false); // This will be set to false after the batch call

    // Second pass: Send all champions to N8N in a single batch
    if (championsToEnrich.length > 0) {
      try {
        const { enrichChampion } = await import("@/api/functions");

        // Status update to "enriching" is handled by enrichChampion function externally via N8N
        // const updatePromises = championsToEnrich.map(champion =>
        //   Champion.update(champion.championId, {
        //     status: "enriching",
        //     last_checked: new Date().toISOString()
        //   })
        // );
        // await Promise.all(updatePromises);
        
        const batchPayload = {
          champions: championsToEnrich.map(champion => ({
            championId: champion.championId,
            linkedinUrl: champion.linkedinUrl,
            name: champion.name
          })),
          isScheduledCheck: false // This is a manual bulk upload
        };

        console.log(`BulkUpload: Sending batch of ${championsToEnrich.length} champions to enrichChampion function`);
        
        const response = await enrichChampion(batchPayload);

        if (response.data && response.data.success) {
          // initiatedSuccessfully = championsToEnrich.length; // Removed
          console.log(`BulkUpload: Successfully sent batch to N8N via enrichChampion function`);
          
          if (currentUser && !currentUser.onboarding_completed) {
            await User.updateMyUserData({ onboarding_completed: true });
          }

          setSuccess(true); // Indicate success
          setTimeout(() => {
            navigate(createPageUrl("Dashboard")); // Redirect to dashboard after a delay
          }, 2000);

        } else {
          // If batch fails, no need to reset status, they remain "monitoring" or whatever they were
          // const resetPromises = championsToEnrich.map(champion =>
          //   Champion.update(champion.championId, { status: "monitoring" })
          // );
          // await Promise.all(resetPromises).catch(console.error);
          
          // enrichmentInitiationFailures = championsToEnrich.length; // Removed
          setError("Failed to initiate enrichment batch. Please try again or contact support.");
          // setIsEnriching(false); // Removed
        }

      } catch (batchError) {
        console.error('BulkUpload: Batch enrichment error:', batchError);
        // Reset champions on error (removed, they remain "monitoring")
        // const resetPromises = championsToEnrich.map(champion =>
        //   Champion.update(champion.championId, { status: "monitoring" })
        // );
        // await Promise.all(resetPromises).catch(console.error);
        
        // enrichmentInitiationFailures = championsToEnrich.length; // Removed
        setError(`Failed to initiate enrichment: ${batchError.message}.`);
        // setIsEnriching(false); // Removed
      } finally {
        setIsProcessing(false); // Ensure processing ends
      }
    } else {
      // setIsEnriching(false); // No champions to poll, hide loading screen (removed)
      // if (totalToProcess > 0 && initiatedSuccessfully === 0 && !error) { // Simplified logic
      if (totalToProcess > 0 && !error) {
        const defaultError = "No new champions were created. This could be due to issues with all URLs, or if all profiles are already tracked.";
        setError(prevError => prevError ? `${prevError}\n${defaultError}` : defaultError);
      } else if (totalToProcess === 0) {
        setError("No valid LinkedIn URLs found in the CSV file.");
      }
      setIsProcessing(false); // Ensure processing ends if no champions to enrich
    }

    // onboarding_completed logic moved to successful batch
    // if (currentUser && !currentUser.onboarding_completed && initiatedSuccessfully > 0) {
    //     await User.updateMyUserData({ onboarding_completed: true });
    // }

    // setResults removed
  };

  // Show a loading spinner while authenticating OR the new bulk enrichment loading screen
  if (!currentUser) { 
     return (
       <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  // Bulk Enrichment Loading Screen (takes precedence if active) (removed)
  // if (isEnriching) { ... }

  // New Success state display
  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl backdrop-blur-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Champions Added Successfully!</h2>
            <p className="text-gray-400 mb-6">
              Your champions are being enriched in the background. You'll be redirected to the dashboard shortly.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Redirecting...
            </div>
        </div>
      </div>
    );
  }

  // Display results after initial file upload and creation, but before enrichment polling concludes
  // This state is only shown if enrichment polling doesn't start (e.g., all errors) or
  // if the user navigates back to this page after polling completed in another session.
  // The primary flow is now `isProcessing` -> `isEnriching` -> (JobAlert or Dashboard) (removed)
  // if (results && !isEnriching) { ... }

  // Main upload interface
  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" aria-label="Back to Dashboard" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulk Add Champions</h1>
            <p className="text-gray-400">Upload a CSV file with LinkedIn Profile URLs</p>
          </div>
        </div>

        {/* Template Download */}
        <div className="mb-6 bg-gray-900/80 border border-gray-700/50 rounded-xl backdrop-blur-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Need a template?</h3>
              <p className="text-sm text-gray-400">
                Download our CSV template. It only needs one column: "LinkedIn URL".
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl backdrop-blur-xl p-6 shadow-2xl shadow-black/20">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-blue-400 bg-blue-500/10" 
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,text/csv" 
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <h3 className="text-lg font-semibold text-blue-400 hover:text-blue-300 mb-2">
                    Drop your CSV file here
                  </h3>
                </label>
                <p className="text-gray-400 mb-4">
                  or click the button below to browse
                </p>
                
                <label htmlFor="csv-upload">
                  <Button variant="outline" className="cursor-pointer bg-white/5 border-white/20 text-white hover:bg-white/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </label>
                
                <div className="mt-6 text-xs text-gray-500 text-left space-y-1">
                  <p><strong>Required column:</strong> <span className="font-normal">LinkedIn URL</span></p>
                  <p>File should be in CSV format, max 5MB.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFile(null); setError(""); /* setProgress(0); */ }} 
                    disabled={isProcessing}
                    className="bg-transparent border-gray-600 hover:bg-gray-700/50 text-gray-300"
                  >
                    Remove
                  </Button>
                </div>

                {/* Processing Progress (Removed separate progress bar) */}
                {/* {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Initiating enrichment...</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )} */}

                {/* Error Display Area */}
                {error && !isProcessing && ( 
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">Upload Error:</p>
                      <pre className="whitespace-pre-wrap text-xs">{error}</pre>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <Button
                  onClick={processFile}
                  disabled={isProcessing || !file} 
                  className="w-full h-12 bg-white text-black font-semibold hover:bg-gray-200"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding Champions... {/* Updated text */}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Add Champions {/* Updated text */}
                    </div>
                  )}
                </Button>
              </div>
            )}
        </div>
      </div>
      
      {/* Job Change Alert Popup (Removed) */}
      {/* {showJobAlert && (
        <JobChangeAlert
          champions={jobAlertChampions}
          onClose={() => {
            setShowJobAlert(false);
            setJobAlertChampions([]);
            navigate(createPageUrl("Dashboard"));
          }}
        />
      )} */}
    </>
  );
}
