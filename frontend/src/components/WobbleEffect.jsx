const WobbleEffect = () => (
  <>
    <style>{`
      @keyframes wobble {
        0%, 100% {
          transform: scale(1) translate(0, 0);
        }
        15% {
          transform: scale(0.99) translate(-1px, -1px) rotate(-0.5deg);
        }
        30% {
          transform: scale(1.01) translate(1px, 1px) rotate(0.5deg);
        }
        45% {
          transform: scale(0.995) translate(0, -1px);
        }
        60% {
          transform: scale(1.005) translate(1px, 0);
        }
        75% {
          transform: scale(1) translate(-0.5px, 0.5px);
        }
      }

      @keyframes glow {
        0%, 100% {
          box-shadow:
            0 0 12px rgba(87, 155, 177, 0.4),     
            0 0 6px rgba(225, 215, 198, 0.6);     
        }
        50% {
          box-shadow:
            0 0 25px rgba(236, 232, 221, 0.9),   
            0 0 10px rgba(87, 155, 177, 1);      
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(0.9);
          opacity: 0.9;
        }
        50% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>

    <div className="flex justify-center my-8">
      <div
        className="relative w-60 h-60 rounded-full p-1 
                   bg-gradient-to-tr from-primary via-white/10 to-secondary 
                   dark:from-primary_dark dark:to-secondary_dark
                   shadow-2xl border-2 border-white/50"
        style={{
          animation:
            "wobble 8s ease-in-out infinite, glow 4s ease-in-out infinite",
        }}
      >
        {/* Inner core bubble */}
        <div
          className="w-full h-full rounded-full bg-white/70 backdrop-blur-sm 
                     flex items-center justify-center transform scale-[0.9] opacity-90 
                     transition-all duration-500"
        >
          {/* Subtle inner pulse */}
          <div
            className="w-1/2 h-1/2 rounded-full bg-accent/50 dark:bg-accent_dark/50"
            style={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>
      </div>
    </div>
  </>
);

export default WobbleEffect;
