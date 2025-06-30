
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    auth, 
    GoogleAuthProvider, 
    signInWithPopup,
    linkWithCredential
} from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

const SignInPrompt = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            
            if (user && user.isAnonymous) {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                    await linkWithCredential(user, credential);
                    toast({
                        title: "Account Linked!",
                        description: "Your anonymous history is now saved to your account.",
                    });
                }
            } else {
                 toast({ title: "Successfully Signed In" });
            }
        } catch (error: any) {
            if (error.code === 'auth/credential-already-in-use') {
                toast({
                    title: "This Google account is already in use.",
                    description: "Please sign in with a different account or contact support.",
                    variant: "destructive",
                });
            } else {
                console.error("Sign-in error:", error);
                toast({
                    title: "Sign-in Failed",
                    description: "Could not sign in with Google. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="frosted-glass rounded-2xl text-center">
                <CardHeader>
                    <CardTitle className="text-xl">Unlock Your Personal History</CardTitle>
                    <CardDescription>
                        Sign in with your Google account to track your mood over time and see your personal calendar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        size="lg" 
                        className="interactive-glow"
                        onClick={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            // Simple SVG for Google logo
                            <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.62-4.8 1.62-3.6 0-6.42-2.9-6.42-6.42s2.82-6.42 6.42-6.42c2.03 0 3.38.79 4.3 1.7l2.4-2.4C19.49 3.46 16.96 2 12.48 2 7.03 2 3 6.03 3 11.5s4.03 9.5 9.48 9.5c2.83 0 4.93-1 6.36-2.38 1.48-1.42 2.13-3.4 2.13-5.72 0-.6-.05-1.18-.15-1.72H12.48z" fill="currentColor"/></svg>
                        )}
                        Sign In with Google
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        Your anonymous contributions will be linked to your new account.
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SignInPrompt;
