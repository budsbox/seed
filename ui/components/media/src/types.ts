import type {
  ComponentPropsWithRef,
  DOMAttributes,
  DetailedHTMLProps,
  MediaHTMLAttributes,
  Ref,
  RefObject,
  VideoHTMLAttributes,
} from 'react';

export interface UseMediaOptions {
  src: string | Blob;

  autoplay?: boolean;
  crossOrigin?: string;
  currentTimeUpdateInterval?: number;
  initialTime?: number;
  loop?: boolean;
  muted?: boolean;
  ref?: Ref<HTMLMediaElement | null>;

  onCurrentTimeChange?: (currentTime: number) => void;
}

export interface UseMediaState extends Pick<
  HTMLMediaElement,
  | 'buffered'
  | 'duration'
  | 'ended'
  | 'error'
  | 'loop'
  | 'muted'
  | 'networkState'
  | 'seeking'
> {
  isPlaying: boolean;
}

export interface MediaModel extends UseMediaState {
  attributes: Partial<
    Readonly<
      DetailedHTMLProps<MediaHTMLAttributes<HTMLMediaElement>, HTMLMediaElement>
    >
  >;
  currentTimeRef: Readonly<RefObject<number>>;
  ref: Readonly<RefObject<HTMLMediaElement>>;
}

export interface UseVideoOptions extends UseMediaOptions {
  poster?: string;
  ref?: Ref<HTMLVideoElement>;
  remotePlayback?: boolean;
}

export interface VideoModel extends MediaModel {
  attributes: ComponentPropsWithRef<'video'>;
}

// type Test = ComponentPropsWithRef<'video'>;

type MediaEvents<TElement extends HTMLMediaElement = HTMLMediaElement> = Pick<
  DOMAttributes<TElement>,
  | 'onAbort'
  | 'onAbortCapture'
  | 'onCanPlay'
  | 'onCanPlayCapture'
  | 'onCanPlayThrough'
  | 'onCanPlayThroughCapture'
  | 'onDurationChange'
  | 'onDurationChangeCapture'
  | 'onEmptied'
  | 'onEmptiedCapture'
  | 'onEncrypted'
  | 'onEncryptedCapture'
  | 'onEnded'
  | 'onEndedCapture'
  | 'onLoadedData'
  | 'onLoadedDataCapture'
  | 'onLoadedMetadata'
  | 'onLoadedMetadataCapture'
  | 'onLoadStart'
  | 'onLoadStartCapture'
  | 'onPause'
  | 'onPauseCapture'
  | 'onPlay'
  | 'onPlayCapture'
  | 'onPlaying'
  | 'onPlayingCapture'
  | 'onProgress'
  | 'onProgressCapture'
  | 'onRateChange'
  | 'onRateChangeCapture'
  | 'onSeeked'
  | 'onSeekedCapture'
  | 'onSeeking'
  | 'onSeekingCapture'
  | 'onStalled'
  | 'onStalledCapture'
  | 'onSuspend'
  | 'onSuspendCapture'
  | 'onTimeUpdate'
  | 'onTimeUpdateCapture'
  | 'onVolumeChange'
  | 'onVolumeChangeCapture'
  | 'onWaiting'
  | 'onWaitingCapture'
>;

export type VideoEvents = MediaEvents<HTMLVideoElement> &
  Pick<VideoHTMLAttributes<HTMLVideoElement>, 'onResize' | 'onResizeCapture'>;
