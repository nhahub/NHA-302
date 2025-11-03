const ProgressBar = ({ current = 0, total = 100, color = "bg-primary" }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const normalized = Math.min(Math.max(progress, 0), 100); // Clamp between 0–100

  return (
    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 ${color} rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
};

export default ProgressBar;
