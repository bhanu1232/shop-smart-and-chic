
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatBubble = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 cursor-pointer" onClick={() => navigate("/chat")}>
      <div className="relative">
        {/* Chat Bubble */}
        <Button
          onClick={() => navigate('/chat')}
          className="h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>


        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help finding products?
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-slate-900 animate-ping opacity-20"></div>
    </div>
  );
};

export default ChatBubble;
