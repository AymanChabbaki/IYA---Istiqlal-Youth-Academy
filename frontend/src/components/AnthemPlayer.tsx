import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

/** Toggles playback of the Istiqlal Party anthem. Single shared <audio> element, playable from anywhere in the app. */
export const AnthemPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);
    return () => audio.removeEventListener("ended", onEnd);
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch {
      toast({ title: "Couldn't play the anthem", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/istiqlal-anthem.mp4" preload="none" />
      <Button
        variant="ghost"
        size="icon"
        aria-label={playing ? "Pause the Istiqlal Party anthem" : "Play the Istiqlal Party anthem"}
        title={playing ? "Pause anthem" : "Play anthem"}
        onClick={toggle}
        className="relative"
      >
        {playing ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5" />}
        {playing && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </Button>
    </>
  );
};
