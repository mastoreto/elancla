import type { LandingTile, LandingTone } from "@ancla/contracts";

/** One ministry of the mosaic while it is being edited; its position in the list is its order. */
export interface LandingRowValues {
  id: string;
  name: string;
  showOnLanding: boolean;
  landingTile: LandingTile;
  landingTone: LandingTone;
  /** Id of the photo of a photo tile; empty when there is none. */
  landingPhotoId: string;
}

export type MoveDirection = "up" | "down";
