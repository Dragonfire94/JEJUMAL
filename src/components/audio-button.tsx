import { Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { playWord } from "@/lib/audio";
import { cn } from "@/lib/utils";

type AudioButtonProps = {
  src: string;
  speak: string;
  label?: string;
  large?: boolean;
};

export function AudioButton({ src, speak, label = "듣기", large = false }: AudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  async function onPlay() {
    setPlaying(true);
    try {
      await playWord({ soundUrl: src, jeju: speak });
    } finally {
      setPlaying(false);
    }
  }

  return (
    <Button
      type="button"
      size={large ? "lg" : "default"}
      variant={large ? "default" : "outline"}
      onClick={() => void onPlay()}
      className={cn(large && "h-16 min-w-40 rounded-xl px-8 text-base")}
      aria-label={label}
    >
      <Volume2 className={cn(large ? "size-5" : "size-4", playing && "animate-pulse")} />
      {label}
    </Button>
  );
}
