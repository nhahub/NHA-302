import React from "react";

function FeatureCard({ icon, title, features, className = "" }) {
  return (
  <div className={`bg-accent dark:bg-accent_dark p-6 rounded-lg shadow-lg dark:shadow-gray-800 text-center group transition-all duration-500 hover:shadow-2xl dark:hover:shadow-gray-700 min-h-[270px] min-w-[340px] h-[270px] w-[340px] flex flex-col justify-between items-stretch border-2 border-transparent hover:border-primary/20 dark:hover:border-primary_dark/20 relative overflow-hidden ${className}`}>
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-center mb-4 space-x-4 justify-start relative z-10">
        <img src={icon} alt={title} className="mb-4 w-10 h-10 object-contain transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 drop-shadow-lg" />
        <h3 className="text-2xl font-quicksand font-bold mb-2 text-black dark:text-white transition-all duration-500 group-hover:translate-x-2 group-hover:text-primary dark:group-hover:text-primary_dark">{title}</h3>
      </div>
      <ul className="list-disc list-inside transition-transform duration-500 group-hover:translate-y-1 relative z-10">
        {features.map((f, i) => (
          <li key={i} className="font-quicksand font-bold text-start px-5 py-2 text-lg text-gray-800 dark:text-gray-200 transition-all duration-300 hover:translate-x-2 hover:text-primary dark:hover:text-primary_dark">{f}</li>
        ))}
      </ul>
    </div>
  );
}

export default FeatureCard;