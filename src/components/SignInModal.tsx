
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { toast } from "sonner";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            console.log("Starting Google sign-in process...");

            const result = await signInWithPopup(auth, googleProvider);
            console.log("Sign-in successful:", result);

            const user = result.user;
            console.log("Firebase user:", user);

            // Sign in the user with Firebase user information - include all required properties
            const userData = {
                id: user.uid,
                uid: user.uid,
                name: user.displayName || '',
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || ''
            };
            
            console.log("User data to sign in:", userData);
            signIn(userData);

            toast.success("Successfully signed in!");
            setIsLoading(false);
            onClose();
            navigate('/profile');
        } catch (error: any) {
            console.error('Sign in failed:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // Handle specific error cases
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Sign-in popup was closed. Please try again.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                toast.error("Sign-in was cancelled. Please try again.");
            } else if (error.code === 'auth/popup-blocked') {
                toast.error("Pop-up was blocked by your browser. Please allow pop-ups and try again.");
            } else {
                toast.error("Failed to sign in. Please try again.");
            }

            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            console.log("Dialog open state changed:", open);
            if (!open) onClose();
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
                </DialogHeader>
                <div className="py-6">
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {isLoading ? "Signing in..." : "Continue with Google"}
                    </Button>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                            or
                        </span>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-gray-900 hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-gray-900 hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SignInModal;
