export type SoundKind = "song" | "call";

export type BirdSoundPayload =
  | {
      available: true;
      soundType: SoundKind;
      audioUrl: string;
      xcId: string;
      recordist: string;
      licenseUrl: string;
      sourceUrl: string;
      length: string;
    }
  | {
      available: false;
    };

export type BirdSoundState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; sound: Extract<BirdSoundPayload, { available: true }> }
  | { status: "unavailable" }
  | { status: "error" };
