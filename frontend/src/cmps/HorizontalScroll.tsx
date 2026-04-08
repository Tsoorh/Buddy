import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  title?: string;
  viewAllPath?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, title, viewAllPath }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-5">
      {title && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 text-white">{title}</h4>
          {viewAllPath && (
            <a href={viewAllPath} className="text-accent text-decoration-none small fw-bold">View All</a>
          )}
        </div>
      )}
      
      <div className="position-relative group">
        <button 
          onClick={() => scroll('left')}
          className="btn btn-dark btn-sm rounded-circle position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-flex align-items-center justify-content-center opacity-0 group-hover-opacity-100"
          style={{ width: '32px', height: '32px', left: '-16px !important', backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid var(--accent-cyan)' }}
        >
          <ChevronLeft size={18} color="var(--accent-cyan)" />
        </button>

        <div 
          ref={scrollRef}
          className="d-flex gap-3 overflow-x-auto pb-3 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {React.Children.map(children, (child) => (
            <div style={{ minWidth: '280px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
              {child}
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="btn btn-dark btn-sm rounded-circle position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-flex align-items-center justify-content-center opacity-0 group-hover-opacity-100"
          style={{ width: '32px', height: '32px', right: '-16px !important', backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid var(--accent-cyan)' }}
        >
          <ChevronRight size={18} color="var(--accent-cyan)" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScroll;
