import { getInitials } from "@/utils/helpers";
import React from "react";

interface AvatarProps {
  name: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name }) => {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
      {getInitials(name)}
    </div>
  );
};