import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Auth from "./Auth";

import AuthCallback from "./AuthCallback";

import Dashboard from "./Dashboard";

import AddChampion from "./AddChampion";

import BulkUpload from "./BulkUpload";

import Settings from "./Settings";

import Analytics from "./Analytics";

import ChampionProfile from "./ChampionProfile";

import Integrations from "./Integrations";

import Onboarding from "./Onboarding";

import Admin from "./Admin";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Auth: Auth,
    
    Dashboard: Dashboard,
    
    AddChampion: AddChampion,
    
    BulkUpload: BulkUpload,
    
    Settings: Settings,
    
    Analytics: Analytics,
    
    ChampionProfile: ChampionProfile,
    
    Integrations: Integrations,
    
    Onboarding: Onboarding,
    
    Admin: Admin,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/AddChampion" element={<AddChampion />} />
                
                <Route path="/BulkUpload" element={<BulkUpload />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/ChampionProfile" element={<ChampionProfile />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Admin" element={<Admin />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}