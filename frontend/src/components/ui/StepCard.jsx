import React from "react";

function StepCard({ step, icon, title, description, iconSize = 8, className = "" }) {
  return (
    <div className={`bg-background dark:bg-background_dark rounded-xl p-8 shadow-lg dark:shadow-gray-800 flex flex-col items-center text-center group transition-all duration-500 hover:shadow-2xl dark:hover:shadow-gray-700 border-2 border-transparent hover:border-primary/20 dark:hover:border-primary_dark/20 relative overflow-hidden ${className}`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 dark:from-accent_dark/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="bg-accent dark:bg-accent_dark rounded-full w-16 h-16 flex items-center justify-center mb-4 font-bold text-2xl text-primary dark:text-primary_dark transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 hover:bg-secondary dark:hover:bg-secondary_dark shadow-md group-hover:shadow-xl relative z-10">{step}</div>
      <div className="flex items-center mb-4 space-x-4 justify-center relative z-10">
        <img src={icon} alt={title} className={`mb-2 w-${iconSize} h-${iconSize} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-lg`} />
        <h3 className="text-2xl font-quicksand font-bold mb-2 text-black dark:text-white transition-all duration-500 group-hover:text-primary dark:group-hover:text-primary_dark">{title}</h3>
      </div>
      <p className="font-quicksand text-base font-medium text-gray-700 dark:text-gray-300 transition-all duration-500 group-hover:translate-y-1 relative z-10">{description}</p>
    </div>
  );
}

export default StepCard;
