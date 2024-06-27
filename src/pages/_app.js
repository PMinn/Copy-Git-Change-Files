import '@/styles/globals.css';
import { NextUIProvider } from "@nextui-org/react";
import { useState } from 'react';
import Layout from '@/components/Layout';
import System from '@/contexts/System.js';

export default function App({ Component, pageProps }) {
    const [projectId, setProjectId] = useState(null);
    const systemContextValue = { projectId, setProjectId };

    return (
        <NextUIProvider>
            <System value={systemContextValue}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </System>
        </NextUIProvider>
    )
}