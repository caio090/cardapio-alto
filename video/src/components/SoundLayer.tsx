import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";

export type SfxEvent = { file: string; atMs: number; volume?: number; name: string };

// Uma trilha de efeitos: cada evento é um <Audio> na sua própria Sequence,
// nomeada, para aparecer e ser ajustável individualmente no Studio.
export const SoundLayer: React.FC<{ name: string; events: SfxEvent[]; gain?: number }> = ({
  name,
  events,
  gain = 1,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={name} layout="none">
      {events.map((e, i) => (
        <Sequence key={i} name={e.name} from={Math.round((e.atMs / 1000) * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${e.file}`)} volume={(e.volume ?? 1) * gain} />
        </Sequence>
      ))}
    </Sequence>
  );
};
