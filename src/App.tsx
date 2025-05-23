import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
    console.log('Rendering App component');

    // Validate required environment variables
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50">
                <div className="p-8 max-w-md bg-white rounded-lg shadow-lg">
                    <h1 className="mb-4 text-2xl font-bold text-red-600">Configuration Error</h1>
                    <p className="mb-4 text-gray-700">
                        Missing Auth0 configuration. Please ensure the following environment variables are set:
                    </p>
                    <ul className="space-y-1 text-sm list-disc list-inside text-gray-600">
                        <li>VITE_AUTH0_DOMAIN</li>
                        <li>VITE_AUTH0_CLIENT_ID</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">
                        Check your .env file and restart the development server.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                // Add audience for API access if needed
                // audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }}
            // Add caching for better performance
            cacheLocation="localstorage"
            useRefreshTokens={true}
        >
            <Home />
            <Analytics />
        </Auth0Provider>
    );
};

export default App;
