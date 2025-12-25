import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../utils/auth';

export default function withAuth(Component) {
    return function ProtectedRoute(props) {
        const router = useRouter();
        const [isClient, setIsClient] = useState(false);

        useEffect(() => {
            setIsClient(true);
        }, []);

        useEffect(() => {
            if (isClient && !isAuthenticated()) {
                router.push('/auth/login');
            }
        }, [router, isClient]);

        // Show loading spinner during SSR and initial client render
        if (!isClient || !isAuthenticated()) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
