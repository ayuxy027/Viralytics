import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';

const App: React.FC = () => {
    console.log('Rendering App component');

    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
        >
            <Home />
        </Auth0Provider>
    );
};

export default App;