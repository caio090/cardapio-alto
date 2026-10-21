import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { BrandOutro } from "./components/BrandOutro";
import { CaptionTrack } from "./components/CaptionTrack";
import { SoundLayer } from "./components/SoundLayer";
import { Transition } from "./components/Transition";
import { interfaceSfx, transitionSfx } from "./data/sound-cues";
import { captions, narration, sceneById, scenes, timedCues } from "./data/timeline";
import type { SceneId } from "./data/script";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Problema } from "./scenes/Scene02Problema";
import { Scene03Desistencia } from "./scenes/Scene03Desistencia";
import { Scene04Contraponto } from "./scenes/Scene04Contraponto";
import { Scene05Solucao } from "./scenes/Scene05Solucao";
import { Scene06Manifesto } from "./scenes/Scene06Manifesto";
import { colors } from "./theme";

const SCENE_COMPONENTS: Record<Exclude<SceneId, "assinatura">, React.FC> = {
  hook: Scene01Hook,
  problema: Scene02Problema,
  desistencia: Scene03Desistencia,
  contraponto: Scene04Contraponto,
  solucao: Scene05Solucao,
  manifesto: Scene06Manifesto,
};

const SCENE_NAMES: Record<SceneId, string> = {
  hook: "01 · Hook",
  problema: "02 · Problema",
  desistencia: "03 · Desistência",
  contraponto: "04 · Contraponto",
  solucao: "05 · Solução",
  manifesto: "06 · Manifesto",
  assinatura: "07 · Assinatura",
};

export const Commercial: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = (ms: number) => Math.round((ms / 1000) * fps);

  // Redução da trilha durante a fala: rampa de 6 frames em cada borda de cue.
  const duckPoints = timedCues.flatMap((c) => [f(c.startMs) - 6, f(c.startMs), f(c.endMs), f(c.endMs) + 8]);
  const musicVolume = (frame: number) => {
    const speaking = timedCues.some((c) => frame >= f(c.startMs) - 6 && frame <= f(c.endMs) + 8);
    if (!speaking) return 0.8;
    const near = duckPoints.reduce((best, p) => (Math.abs(p - frame) < Math.abs(best - frame) ? p : best), 0);
    return interpolate(Math.abs(frame - near), [0, 6], [0.5, 0.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const outro = sceneById("assinatura");
  const c16 = timedCues.find((c) => c.id === "c16")!;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      {scenes
        .filter((s) => s.id !== "assinatura")
        .map((s) => {
          const Component = SCENE_COMPONENTS[s.id as Exclude<SceneId, "assinatura">];
          return (
            <Sequence key={s.id} name={SCENE_NAMES[s.id]} from={f(s.startMs)} durationInFrames={f(s.endMs) - f(s.startMs)}>
              <Component />
            </Sequence>
          );
        })}
      <Sequence name={SCENE_NAMES.assinatura} from={f(outro.startMs)} durationInFrames={f(outro.endMs) - f(outro.startMs)}>
        <BrandOutro
          cta="Fazer meu diagnóstico"
          url="cardapio-alto.vercel.app"
          voiceStartFrame={f(c16.startMs - outro.startMs)}
        />
      </Sequence>

      {/* Transições justificadas: impacto do gancho, virada para a solução, respiro da assinatura. */}
      <Sequence name="Transição · flash gancho" from={f(timedCues[0].startMs + (timedCues[0].endMs - timedCues[0].startMs) * 0.55)} durationInFrames={4}>
        <Transition kind="flash" durationInFrames={4} />
      </Sequence>
      <Sequence name="Transição · virada" from={f(sceneById("solucao").startMs) - 9} durationInFrames={18}>
        <Transition kind="wipe" durationInFrames={18} />
      </Sequence>
      <Sequence name="Transição · assinatura" from={f(outro.startMs) - 8} durationInFrames={16}>
        <Transition kind="dip" durationInFrames={16} />
      </Sequence>

      <Sequence name="Legendas" layout="none">
        <CaptionTrack cues={timedCues} captions={captions} />
      </Sequence>

      {/* Trilha 1 — narração (só entra quando o arquivo real existe). */}
      {narration.audioFile ? (
        <Sequence name="Áudio 1 · Narração" layout="none">
          <Audio src={staticFile(narration.audioFile)} volume={1} />
        </Sequence>
      ) : null}
      {/* Trilha 2 — música, com ducking sob a voz. */}
      <Sequence name="Áudio 2 · Trilha musical" layout="none">
        <Audio src={staticFile("audio/musica/trilha.wav")} volume={musicVolume} />
      </Sequence>
      <SoundLayer name="Áudio 3 · Transições" events={transitionSfx} />
      <SoundLayer name="Áudio 4 · Interface e ambiente" events={interfaceSfx} gain={0.8} />
    </AbsoluteFill>
  );
};
