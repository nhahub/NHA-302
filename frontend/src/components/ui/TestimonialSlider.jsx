import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    name: "Seif Ahmed",
    role: "Café",
    text: "Payflow helped me increase my profits by 25% in just 2 months!",
    image: "",
    stars: 5,
  },
  {
    name: "Fatma Mohamed",
    role: "Fashion Boutique",
    text: "Sales went up 40% after using their AI pricing suggestions.",
    image: "",
    stars: 5,
  },
  {
    name: "Omar Mahmoud",
    role: "Electronics Store",
    text: "Best tools for managing my inventory easily.",
    image: "",
    stars: 5,
  },
  {
    name: "Aya Hassan",
    role: "Online Retail",
    text: "The AI-driven insights are a game changer for our business.",
    image: "",
    stars: 5,
  },
  {
    name: "Karim Ali",
    role: "Restaurant",
    text: "Customer engagement has never been higher. Highly recommend!",
    image: "",
    stars: 4,
  },
];


function TestimonialSlider() {
  const [active, setActive] = useState(1); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prevActive) => (prevActive + 1) % testimonials.length);
    }, 3500);

    return () => clearTimeout(timer);
  }, [active]);

  const handlePrev = () => {
    setActive((prevActive) => (prevActive - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActive((prevActive) => (prevActive + 1) % testimonials.length);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center">
        <button
            onClick={handlePrev}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-30 text-4xl text-black dark:text-white hover:text-primary dark:hover:text-primary_dark transition-colors"
            aria-label="Previous testimonial"
        >
            &#x276E;
        </button>

        <div className="relative w-full h-96 overflow-hidden flex items-center justify-center">
            {testimonials.map((testimonial, i) => {
                let offset = active - i;
                const half = Math.floor(testimonials.length / 2);
                if (offset < -half) offset += testimonials.length;
                if (offset > half) offset -= testimonials.length;

                const isVisible = Math.abs(offset) <= 1;

                const styles = {
                    transform: `translateX(${-offset * 90}%) scale(${i === active ? 1 : 0.65})`,
                    opacity: isVisible ? 1 : 0,
                    zIndex: testimonials.length - Math.abs(offset),
                    transition: 'all 0.5s ease-out',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                };

                return (
                    <div
                        key={testimonial.name}
                        className="w-full max-w-sm p-6 bg-[#4A909E] dark:bg-primary_dark rounded-xl shadow-lg dark:shadow-gray-800 text-white"
                        style={styles}
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0">
                                 <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/ccc/fff?text=Error'; }}
                                  />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{testimonial.name}</h3>
                                <p className="text-sm opacity-80">{testimonial.role}</p>
                            </div>
                        </div>
                        <div className="flex mb-4">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <svg key={idx} className={`w-5 h-5 ${idx < testimonial.stars ? 'text-yellow-400' : 'text-gray-300/40'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.368-2.446a1 1 0 00-1.175 0l-3.368 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.07 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-sm leading-relaxed">{testimonial.text}</p>
                    </div>
                );
            })}
        </div>
        
        <button
            onClick={handleNext}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-30 text-4xl text-black dark:text-white hover:text-primary dark:hover:text-primary_dark transition-colors"
            aria-label="Next testimonial"
        >
            &#x276F;
        </button>
    </div>
  );
}


export default TestimonialSlider;

