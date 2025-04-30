import React from 'react';
import { GamepadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TestLogin: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="w-full max-w-md px-4 py-8 animate-fadeIn">
        <div className={cn(
          "w-full overflow-hidden border-none",
          "shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
          "backdrop-blur-sm bg-white/95",
          "rounded-xl p-6"
        )}>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 border border-blue-200">
              <GamepadIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-blue-500 mb-2">
            Test Login Page
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            This is a test page to check if styling works
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className={cn(
                  "h-11 px-4 py-2 bg-gray-50 w-full",
                  "border border-gray-200 focus:border-blue-500",
                  "hover:border-blue-300 hover:bg-gray-100",
                  "transition-all duration-200",
                  "rounded-md"
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className={cn(
                  "h-11 px-4 py-2 bg-gray-50 w-full",
                  "border border-gray-200 focus:border-blue-500",
                  "hover:border-blue-300 hover:bg-gray-100",
                  "transition-all duration-200",
                  "rounded-md"
                )}
              />
            </div>
            <button
              className={cn(
                "w-full h-11 text-base font-medium text-white",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:opacity-90 hover:translate-y-[-1px]",
                "active:translate-y-[1px]",
                "transition-all duration-200",
                "shadow-md hover:shadow-lg",
                "rounded-md mt-4"
              )}
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;
