
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
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <title>Google</title>
                                <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.01,4.73 15.45,5.36 16.65,6.57L18.88,4.45C16.99,2.64 14.74,1.73 12.19,1.73C6.92,1.73 2.73,6.25 2.73,12C2.73,17.75 6.92,22.27 12.19,22.27C17.6,22.27 21.5,18.33 21.5,12.27C21.5,11.77 21.45,11.43 21.35,11.1Z"/>
                            </svg>
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
