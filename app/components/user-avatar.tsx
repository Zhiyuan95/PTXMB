import { useMemo } from "react";

// 定义一组类似 Google/Material Design 的柔和背景色
const avatarColors = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", 
  "bg-yellow-500", "bg-lime-500", "bg-green-500", 
  "bg-emerald-500", "bg-teal-500", "bg-cyan-500", 
  "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
  "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
  "bg-pink-500", "bg-rose-500"
];

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({ 
  name, 
  email, 
  size = "md", 
  className = "" 
}: UserAvatarProps) {
  // 显示逻辑：优先显示名字，没有名字显示邮箱，都空显示 "?"
  const displayName = name || email || "?";
  
  // 1. 获取首字母 (支持中文和英文)
  const initial = displayName.charAt(0).toUpperCase();

  // 2. 根据名字计算一个固定的颜色索引 (Hash算法)
  // 这样同一个用户永远是同一个颜色
  const colorClass = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
  }, [displayName]);

  // 尺寸映射
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClass} 
        rounded-full flex items-center justify-center 
        text-white font-bold shadow-sm select-none
        ${className}
      `}
      title={displayName} // 鼠标悬停显示全名
    >
      {initial}
    </div>
  );
}