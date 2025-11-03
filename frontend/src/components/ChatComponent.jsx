import { useState, useRef, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { askAI } from "../api/ai";
import { useTranslation } from "react-i18next";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const { t, i18n } = useTranslation();
  useEffect(() => {
    setMessages([
      {
        sender: "popo",
        text: t("PopoIntroduction"),
      },
    ]);
  }, [i18n.language, t]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input on initial load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAI(input);
      const botMessage = {
        sender: "popo",
        text: res?.response || "No response found.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errMsg =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { sender: "popo", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-[45vh] bg-background dark:bg-background_dark flex flex-col items-center py-4 sm:py-6 md:py-10 font-quicksand">
      <div className="w-full max-w-lg h-full flex flex-col px-3 sm:px-4 md:px-6">
        {/* Chat messages container with flexible height */}
        <div className="flex-1 overflow-y-auto mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm sm:text-base whitespace-pre-line dark:text-white ${
                  msg.sender === "user"
                    ? "bg-accent dark:bg-accent_dark text-gray-900 dark:text-white"
                    : "bg-transparent text-gray-800 dark:text-gray-300 border border-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-transparent border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-gray-500 dark:text-gray-300 text-sm">
                    popo is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input section */}
        <div className="relative w-full top-5">
          <input
            ref={inputRef}
            type="text"
            placeholder={t("InputPlaceHolder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full px-4 py-3 pr-12 sm:pr-14 rounded-full bg-secondary dark:bg-secondary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:dark:ring-primary_dark/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary dark:bg-primary_dark transition-all duration-200
              ${
                input.trim() && !loading
                  ? "opacity-100 cursor-pointer hover:bg-primary/90 hover:dark:bg-primary_dark/90 active:scale-95"
                  : "opacity-40 cursor-not-allowed"
              }
            `}
          >
            <FaArrowUp className="text-white text-sm sm:text-base" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
