export function AnnouncementBar() {
  const message = (
    <span className="flex items-center gap-2 px-4 sm:px-12">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white shrink-0" />
      <span>
        🇰🇷 <strong>Authentic K-Beauty Hub:</strong> 100% Direct Seoul Import Korean Cosmetics & Skincare in Bangladesh!
      </span>
    </span>
  );

  return (
    <div className="bg-[#BA478F] text-white text-[11px] sm:text-xs py-2 font-medium overflow-hidden whitespace-nowrap flex relative w-full">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {message}
        {message}
        {message}
        {message}
      </div>
    </div>
  );
}
