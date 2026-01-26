import { useState, useCallback } from 'react';

declare const postquee_admin_vars: {
    ajaxurl: string;
    nonce: string;
};

export const useProviderFunction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callFunction = useCallback(async (integrationId: string, functionName: string, data: any = {}) => {
        setLoading(true);
        setError(null);

        // Safe access to global variables
        const adminVars = (window as any).postquee_admin_vars || (window as any).postqueeAdminVars;
        const wpVars = (window as any).postqueeWP;

        const ajaxUrl = adminVars?.ajaxurl || wpVars?.ajaxUrl; // Note case difference: ajaxurl vs ajaxUrl
        const nonce = adminVars?.nonce || wpVars?.aiNonce;

        if (!ajaxUrl || !nonce) {
            console.error('PostQuee Admin Vars missing:', window);
            setError('Configuration Error: PostQuee variables not found. Please reload the page.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('action', 'postquee_integration_function');
        formData.append('nonce', nonce);
        formData.append('id', integrationId);
        formData.append('function', functionName);
        formData.append('data', JSON.stringify(data));

        console.log('Calling Provider Function:', functionName, 'for', integrationId);

        try {
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.data || 'Unknown error');
            }

            return json.data;
        } catch (err: any) {
            console.error('Provider Function Error:', err);
            setError(err.message || 'Request Failed');
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    return { callFunction, loading, error };
};
