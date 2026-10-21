import { Composition, Still } from "remotion";
import { Commercial } from "./Commercial";
import { msToFrames, totalMs } from "./data/timeline";
import "./fonts";
import { Cover } from "./Cover";
import { VIDEO } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ComercialCardapioAlto"
        component={Commercial}
        // Duração derivada da locução (narration-timing.json) + cauda da assinatura.
        durationInFrames={msToFrames(totalMs, VIDEO.fps)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Still id="Capa" component={Cover} width={VIDEO.width} height={VIDEO.height} />
    </>
  );
};
