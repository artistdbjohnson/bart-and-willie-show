import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type InstagramPost = {
  id: string;
  shortcode: string;
  caption: string;
  imageUrl: string;
  permalink: string;
  kind: "clip" | "post";
};

export type InstagramFeed =
  | {
      ok: true;
      username: string;
      fullName: string;
      biography: string;
      reportedCount: number | null;
      posts: InstagramPost[];
    }
  | { ok: false; posts: [] };

const PROFILE = "https://www.instagram.com/bartandwillieshow/";
const PROFILE_API =
  "https://www.instagram.com/api/v1/users/web_profile_info/?username=bartandwillieshow";

export const INSTAGRAM_URL = PROFILE;

const IG_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "X-IG-App-ID": "936619743392459",
  Referer: PROFILE,
};

type IgNode = {
  shortcode?: string;
  is_video?: boolean;
  product_type?: string;
  display_url?: string;
  thumbnail_src?: string;
  edge_media_to_caption?: { edges?: { node?: { text?: string } }[] };
};

async function readProfile(): Promise<string | null> {
  try {
    const response = await fetch(PROFILE_API, {
      headers: IG_HEADERS,
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (response.ok) {
      const text = await response.text();
      if (text.trim().startsWith("{")) return text;
    }
  } catch {
    /* Node's client is sometimes refused. Curl is the next try. */
  }

  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sL",
        "--max-time",
        "12",
        "-A",
        IG_HEADERS["User-Agent"],
        "-H",
        `Accept: ${IG_HEADERS.Accept}`,
        "-H",
        `X-IG-App-ID: ${IG_HEADERS["X-IG-App-ID"]}`,
        "-H",
        `Referer: ${IG_HEADERS.Referer}`,
        PROFILE_API,
      ],
      { timeout: 15000, maxBuffer: 8_000_000 },
    );
    const text = stdout.toString();
    if (text.trim().startsWith("{")) return text;
  } catch {
    return null;
  }
  return null;
}

export async function getInstagram(): Promise<InstagramFeed> {
  try {
    const raw = await readProfile();
    if (!raw) return { ok: false, posts: [] };
    const payload = JSON.parse(raw) as {
      data?: {
        user?: {
          full_name?: string;
          biography?: string;
          edge_owner_to_timeline_media?: {
            count?: number;
            edges?: { node?: IgNode }[];
          };
        };
      };
    };
    const user = payload.data?.user;
    const edges = user?.edge_owner_to_timeline_media?.edges ?? [];
    const posts = edges
      .map((edge) => {
        const node = edge.node;
        if (!node?.shortcode) return null;
        const imageUrl = node.display_url || node.thumbnail_src || "";
        if (!imageUrl) return null;
        const clip = Boolean(node.is_video) || node.product_type === "clips";
        const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text?.trim() ?? "";
        const post: InstagramPost = {
          id: node.shortcode,
          shortcode: node.shortcode,
          caption,
          imageUrl,
          permalink: clip
            ? `https://www.instagram.com/reel/${node.shortcode}/`
            : `https://www.instagram.com/p/${node.shortcode}/`,
          kind: clip ? "clip" : "post",
        };
        return post;
      })
      .filter((post): post is InstagramPost => post !== null);

    if (posts.length === 0) return { ok: false, posts: [] };

    return {
      ok: true,
      username: "bartandwillieshow",
      fullName: user?.full_name || "The Bart and Willie Show",
      biography: user?.biography || "",
      reportedCount: user?.edge_owner_to_timeline_media?.count ?? null,
      posts,
    };
  } catch {
    return { ok: false, posts: [] };
  }
}
