"use client";

export const BackgroundVideo = () => {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      suppressHydrationWarning
      className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      style={{
        filter: "brightness(0.7)",
      }}
    >
      <source src="/videos/background.mp4" type="video/mp4" />
    </video>
  );
};
