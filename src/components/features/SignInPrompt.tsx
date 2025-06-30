
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
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                <title>Google</title>
                                <g fill="none" fillRule="evenodd">
                                    <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1682-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7772 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6155z" fill="#4285F4"/>
                                    <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1818l-2.9087-2.2581c-.806.5446-1.8409.8682-2.9564.8682-2.2773 0-4.2082-1.5382-4.9-3.5968H1.0714v2.3368C2.5668 16.2972 5.5214 18 9 18z" fill="#34A853"/>
                                    <path d="M4.1 10.8182c-.121-.36-.1882-.7432-.1882-1.1364s.0673-.7764.1882-1.1364V6.2136H1.0714C.3859 7.5645 0 9.2045 0 10.9455c0 1.741.3859 3.381.9286 4.7319l3.0286-2.3368c-.121-.36-.1882-.7432-.1882-1.1364z" fill="#FBBC05"/>
                                    <path d="M9 3.8182c1.3214 0 2.5077.4545 3.4405 1.3455l2.5818-2.5818C13.4632.9927 11.43.0001 9 .0001 5.5214.0001 2.5668 1.7028 1.0714 4.091L4.1 6.4277c.6918-2.0586 2.6227-3.5968 4.9-3.5968z" fill="#EA4335"/>
                                </g>
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
