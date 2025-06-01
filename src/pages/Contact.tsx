import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

    const handleAcceptTermsChange = (checked: CheckedState) => {
        setAcceptTerms(checked === true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptTerms) {
            toast.error("Please accept the Terms of Service.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Add message to Firestore
            await addDoc(collection(db, "contact_messages"), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                createdAt: serverTimestamp(),
                status: "unread",
            });

            toast.success("Message sent successfully!", {
                description: "We'll get back to you as soon as possible.",
            });
            setFormData({ name: "", email: "", message: "" });
            setAcceptTerms(false);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message", {
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="h-[70px]">
                <Navbar />
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
                    {/* Left Section: Text and Contact Info */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Get in Touch</h1>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Use our contact form for all information requests or
                            contact us directly using the contact information below.
                        </p>
                        <p className="text-slate-600 mb-8">
                            Feel free to get in touch with us via email or phone
                        </p>
                        <hr className="border-slate-200 mb-8" />

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-900 rounded-lg flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900 mb-1">Our Office Location</h3>
                                    <p className="text-slate-600">
                                        The Interior Design Studio Company<br />
                                        The Courtyard, Al Quoz 1, Colorado, USA
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-900 rounded-lg flex-shrink-0">
                                    <Phone className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900 mb-1">Phone (Landline)</h3>
                                    <p className="text-slate-600">
                                        +912 3 567 8987
                                    </p>
                                </div>
                            </div>

                            {/* Removed Email and Business Hours as per image */}

                        </div>
                    </div>

                    {/* Right Section: Contact Form */}
                    <Card className="border-2 bg-white">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Get started with a free quotation</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <Input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border-slate-300 focus:border-slate-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter a valid email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border-slate-300 focus:border-slate-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Enter your message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full min-h-[150px] bg-white border-slate-300 focus:border-slate-900"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptTerms}
                                        onCheckedChange={handleAcceptTermsChange}
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I accept the <a href="#" className="underline">Terms of Service</a>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !acceptTerms}
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-base rounded-md"
                                >
                                    {isSubmitting ? (
                                        "Submitting..."
                                    ) : (
                                        "Submit your request"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact; 