import { Integration } from '@prisma/client';

export interface ClientInformation {
  client_id: string;
  client_secret: string;
  instanceUrl: string;
}
export interface IAuthenticator {
  authenticate(
    params: {
      code: string;
      codeVerifier: string;
      refresh?: string;
    },
    clientInformation?: ClientInformation
  ): Promise<AuthTokenDetails | string>;
  refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
  reConnect?(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
  generateAuthUrl(
    clientInformation?: ClientInformation
  ): Promise<GenerateAuthUrlResponse>;
  analytics?(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]>;
  postAnalytics?(
    integrationId: string,
    accessToken: string,
    postId: string,
    fromDate: number,
  ): Promise<AnalyticsData[]>;
  resolveReleaseId?(
    accessToken: string,
    releaseId: string,
    integration: Integration,
    settings: any,
    releaseURL: string
  ): Promise<
    | { postId: string; releaseURL: string }
    | { pending: true }
    | { unavailable: true }
    | undefined
  >; // Final id + URL to persist when the stored releaseId is still a publish id, pending when the platform has no final id yet, unavailable when the post will never get one, undefined when nothing to resolve
  releaseUrl?(
    accessToken: string,
    releaseId: string,
    integration: Integration
  ): Promise<string | undefined>; // URL of a post the user connected by hand
  changeNickname?(
    id: string,
    accessToken: string,
    name: string
  ): Promise<{ name: string }>;
  changeProfilePicture?(
    id: string,
    accessToken: string,
    url: string
  ): Promise<{ url: string }>;
  missing?(
    id: string,
    accessToken: string
  ): Promise<{ id: string; url: string }[]>;
  // The account's most recent posts on the platform with their numbers,
  // listed on the Analytics page
  recentPosts?(id: string, accessToken: string): Promise<RecentPost[]>;
}

export interface RecentPost {
  id: string;
  caption: string;
  thumbnail: string | null;
  url: string | null;
  publishedAt: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

export interface AnalyticsData {
  label: string;
  data: Array<{ total: string; date: string }>;
  percentageChange: number;
}


// A comment or reply someone left on a published post, read from the
// platform when the inbox is opened (never stored)
export type PlatformComment = {
  id: string; // The platform's id of the comment
  parentId?: string; // Set on a reply to another comment
  replyToId?: string; // The id replyToComment needs to answer this comment, for platforms that only nest one level (defaults to id)
  text: string;
  createdAt: string; // ISO date
  author: {
    name: string;
    username?: string;
    picture?: string;
  };
  own?: boolean; // Left by the connected channel itself
  url?: string; // Link to the comment on the platform
};

export type GenerateAuthUrlResponse = {
  url: string;
  codeVerifier: string;
  state: string;
};

export type AuthTokenDetails = {
  id: string;
  name: string;
  error?: string;
  accessToken: string; // The obtained access token
  refreshToken?: string; // The refresh token, if applicable
  expiresIn?: number; // The duration in seconds for which the access token is valid
  picture?: string;
  username: string;
  additionalSettings?: {
    title: string;
    description: string;
    type: 'checkbox' | 'text' | 'textarea';
    value: any;
    regex?: string;
  }[];
};

export interface ISocialMediaIntegration {
  post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]>; // Schedules a new post

  postPending?(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]>; // Like `post`, but may return a `pending` response the workflow resolves via checkPostStatus / finalizePost

  comment?(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]>; // Schedules a new post
}

export type PostResponse = {
  id: string; // The db internal id of the post
  postId: string; // The ID of the scheduled post returned by the platform
  releaseURL: string; // The URL of the post on the platform
  status: string; // Status of the operation or initial post status, 'pending' means the workflow must poll checkPostStatus
  pendingData?: any; // Opaque provider state used by checkPostStatus / finalizePost, never inspected by generic code
};

// Returned by checkPostStatus / finalizePost:
// 'pending' - the platform is still processing, poll again later
// 'ready' - processing is done, the workflow must call finalizePost to run the remaining mutations
// 'completed' - the post is fully published
//
// Contract: once finalizePost's mutations have actually gone through on the
// platform, checkPostStatus must return 'completed' - never 'ready' again -
// otherwise a finalizePost retry after an unknown-outcome failure would re-run
// the mutations and duplicate the post. The only exception: when finalizePost's
// mutation is idempotent (like setting a thumbnail), returning 'ready' again is
// allowed, since re-running it cannot duplicate anything.
export type PendingCheckResponse =
  | { status: 'pending'; pendingData: any }
  | { status: 'ready'; pendingData: any }
  | { status: 'completed'; postId: string; releaseURL: string };

export type PostDetails<T = any> = {
  id: string;
  message: string;
  settings: T;
  media?: MediaContent[];
  poll?: PollDetails;
};

export type PollDetails = {
  options: string[]; // Array of poll options
  duration: number; // Duration in hours for which the poll will be active
};

export type MediaContent = {
  type: 'image' | 'video'; // Type of the media content
  path: string;
  alt?: string;
  thumbnail?: string;
  thumbnailTimestamp?: number;
};

export type FetchPageInformationResult = {
  id: string;
  name: string;
  access_token: string;
  picture: string;
  username: string;
};

export interface SocialProvider
  extends IAuthenticator,
    ISocialMediaIntegration {
  identifier: string;
  refreshWait?: boolean;
  // A token rejected by finalizePost means its mutation did not run (it makes
  // one mutating call): the post activity then refreshes the token and repeats
  // finalizePost itself. Without it the workflow refreshes and goes back to
  // checkPostStatus, which for an arm -> confirm -> publish provider finds the
  // confirmed attempt and stops with a false "may have already published".
  // Never set it when finalizePost can throw RefreshToken after a mutation
  // that cannot be repeated.
  refreshRepeat?: boolean;
  convertToJPEG?: boolean;
  stripLinks?: () => boolean;
  refreshCron?: boolean;
  // Cancels the authorization on the platform when the channel is deleted
  // (in the app, by account deletion or by the disconnected-channel cleanup).
  // Platforms such as YouTube require it. Best effort: an error is logged and
  // never blocks the deletion
  revokeAccess?(accessToken: string, refreshToken: string): Promise<void>;
  // Checked once a day, even when the channel publishes nothing, so access
  // removed in the platform's own settings is noticed and starts the
  // disconnected-channel cleanup (YouTube requires deletion within 30 days)
  dailyAuthorizationCheck?: boolean;
  refreshErrorMessage?(err: any): string | undefined;
  dto?: any;
  maxLength: (additionalSettings?: any, settings?: any) => number;
  checkValidity(
    posts: Array<{ path: string; thumbnail?: string; alt?: string }[]>,
    settings: any,
    additionalSettings: any[]
  ): Promise<string | true>;
  checkPostStatus(
    accessToken: string,
    pendingData: any,
    integration: Integration
  ): Promise<PendingCheckResponse>;
  migrationMatch(
    auth: Pick<AuthTokenDetails, 'id' | 'username'>,
    integration: Omit<Integration, 'token' | 'refreshToken'>
  ): boolean;
  finalizePost(
    accessToken: string,
    pendingData: any,
    integration: Integration
  ): Promise<PendingCheckResponse>;
  isWeb3?: boolean;
  isChromeExtension?: boolean;
  extensionCookies?: { name: string; domain: string }[];
  editor: 'none' | 'normal' | 'markdown' | 'html';
  inlineImages?: (settings?: any) => boolean;
  customFields?: () => Promise<
    {
      key: string;
      label: string;
      defaultValue?: string;
      validation: string;
      type: 'text' | 'password';
      hint?: string;
    }[]
  >;
  name: string;
  toolTip?: string;
  oneTimeToken?: boolean;
  isBetweenSteps: boolean;
  scopes: string[];
  externalUrl?: (
    url: string
  ) => Promise<{ client_id: string; client_secret: string }>;
  mention?: (
    token: string,
    data: { query: string },
    id: string,
    integration: Integration
  ) => Promise<
    | { id: string; label: string; image: string; doNotCache?: boolean }[]
    | { none: true }
  >;
  mentionFormat?(idOrHandle: string, name: string): string;
  // A platform's own "app removed" / "delete my data" callback (for example
  // Meta's deauthorize and data deletion callbacks): returns the platform
  // user id the request is about, or null when the request is not genuine
  platformUserFromCallback?(body: Record<string, unknown>): string | null;
  // Providers whose channels are connected through the same platform app, so
  // that app's callback removes them too (defaults to this provider)
  callbackProviders?: string[];
  fetchPageInformation?(
    accessToken: string,
    data: any
  ): Promise<FetchPageInformationResult>;
  // Comments and replies other people left on a published post (postId is
  // the stored releaseId), newest first. Read on demand for the inbox
  listComments?(
    id: string,
    accessToken: string,
    postId: string,
    integration: Integration
  ): Promise<PlatformComment[]>;
  // Answers a comment returned by listComments, as the connected channel
  replyToComment?(
    id: string,
    accessToken: string,
    postId: string,
    commentId: string,
    message: string,
    integration: Integration
  ): Promise<{ id: string; url?: string }>;
}
