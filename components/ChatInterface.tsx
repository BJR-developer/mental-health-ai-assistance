"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface Message {
  text: string;
  sender: "user" | "ai";
}

enum Language {
  English = "en",
  Bengali = "bn",
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>(Language.English);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = { text: inputMessage, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");

    try {
      const aiResponse = await getGeminiResponse(inputMessage, language);
      const aiMessage: Message = { text: aiResponse, sender: "ai" };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        text:
          language === Language.English
            ? "Sorry, I couldn't process your request. Please try again."
            : "দুঃখিত, আমি আপনার অনুরোধ প্রক্রিয়া করতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const getGeminiResponse = async (
    message: string,
    language: Language
  ): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt =
        language === Language.English
          ? `You are a compassionate mental health support assistant. Respond to the following message with empathy and support: "${message}"`
          : `আপনি একজন সহানুভূতিশীল মানসিক স্বাস্থ্য সহায়তা সহকারী। নিম্নলিখিত বার্তার প্রতি সহানুভূতি ও সমর্থন সহ উত্তর দিন: "${message}"`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error getting Gemini AI response:", error);
      return language === Language.English
        ? "I apologize, but I'm having trouble responding right now. How else can I support you?"
        : "আমি দুঃখিত, কিন্তু আমি এখন উত্তর দিতে সমস্যা হচ্ছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
    }
  };

  const handleNameSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userName.trim() !== "") {
      setShowNamePrompt(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prevLang) =>
      prevLang === Language.English ? Language.Bengali : Language.English
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mental Health Support Chat</h1>
          {userName && <p>Welcome, {userName}</p>}
        </div>
        <button
          onClick={toggleLanguage}
          className="bg-blue-700 px-3 py-1 rounded"
        >
          {language === Language.English ? "বাংলা" : "English"}
        </button>
      </header>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow p-2 border rounded-l-lg"
            placeholder={
              language === Language.English
                ? "Type your message..."
                : "আপনার বার্তা টাইপ করুন..."
            }
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-2 rounded-r-lg"
          >
            {language === Language.English ? "Send" : "পাঠান"}
          </button>
        </div>
      </div>

      <AlertDialog open={showNamePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === Language.English
                ? "Welcome to Mental Health Support Chat"
                : "মানসিক স্বাস্থ্য সহায়তা চ্যাটে স্বাগতম"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === Language.English
                ? "Please enter your name to begin chatting."
                : "চ্যাট শুরু করতে আপনার নাম লিখুন।"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={
                language === Language.English ? "Your name" : "আপনার নাম"
              }
            />
            <AlertDialogFooter>
              <AlertDialogAction type="submit">
                {language === Language.English
                  ? "Start Chatting"
                  : "চ্যাট শুরু করুন"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatInterface;
