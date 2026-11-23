import { DomainError } from "../../../../core/errors";

/** There is no video platform to ask (no `YOUTUBE_API_KEY`) or it could not answer (quota, network). */
export class PlatformUnavailableError extends DomainError {
  readonly status = 503;
  readonly code = "platform_unavailable";

  constructor() {
    super("The video platform is not available right now");
  }
}

/** The pasted text is neither a video URL nor a video id. */
export class InvalidVideoIdError extends DomainError {
  readonly status = 422;
  readonly code = "invalid_video_id";

  constructor() {
    super("That is not a valid video link or id");
  }
}

export class VideoNotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "video_not_found";

  constructor() {
    super("The video does not exist");
  }
}

export class VideoPrivateError extends DomainError {
  readonly status = 422;
  readonly code = "video_private";

  constructor() {
    super("The video is private; make it public or unlisted first");
  }
}

/** The video already belongs to a sermon or an episode of the organization. */
export class VideoAlreadyLinkedError extends DomainError {
  readonly status = 409;
  readonly code = "video_already_linked";

  constructor() {
    super("That video is already linked to a sermon");
  }
}

/** The sermon has a live revision (published or paused): the public site already shows it. */
export class SermonLiveError extends DomainError {
  readonly status = 409;
  readonly code = "sermon_live";

  constructor() {
    super("The sermon is published; pause it before deleting it");
  }
}

/** The pasted text is neither a playlist URL nor a playlist id. */
export class InvalidPlaylistIdError extends DomainError {
  readonly status = 422;
  readonly code = "invalid_playlist_id";

  constructor() {
    super("That is not a valid playlist link or id");
  }
}

/** The playlist does not exist or is private. */
export class PlaylistNotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "playlist_not_found";

  constructor() {
    super("The playlist does not exist or is private");
  }
}

/** A series of the organization is already linked to that playlist. */
export class PlaylistAlreadyImportedError extends DomainError {
  readonly status = 409;
  readonly code = "playlist_already_imported";

  constructor() {
    super("That playlist is already imported as a series");
  }
}

/** Deleting would leave sermons pointing at a series that no longer exists. */
export class SeriesInUseError extends DomainError {
  readonly status = 409;
  readonly code = "series_in_use";

  constructor() {
    super("Sermons belong to this series; remove them from it first");
  }
}
