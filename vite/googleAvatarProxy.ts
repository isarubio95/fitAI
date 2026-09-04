import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { isGoogleAvatarUrl, parseGoogleAvatarProxyTarget } from "../src/lib/avatarUrl.ts";

async function proxyGoogleAvatar(req: IncomingMessage, res: ServerResponse) {
  const target = parseGoogleAvatarProxyTarget(req.url ?? "");
  if (!target) {
    res.statusCode = 400;
    res.end();
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: { Accept: "image/*" },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });

    if (!upstream.ok) {
      res.statusCode = upstream.status === 429 ? 429 : 502;
      res.end();
      return;
    }

    const finalUrl = new URL(upstream.url);
    if (!isGoogleAvatarUrl(finalUrl.toString())) {
      res.statusCode = 400;
      res.end();
      return;
    }

    const contentType = (upstream.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!contentType.startsWith("image/")) {
      res.statusCode = 502;
      res.end();
      return;
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.end(body);
  } catch {
    res.statusCode = 502;
    res.end();
  }
}

export function googleAvatarDevProxy(): Plugin {
  return {
    name: "google-avatar-dev-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/google-avatar")) {
          next();
          return;
        }
        void proxyGoogleAvatar(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/google-avatar")) {
          next();
          return;
        }
        void proxyGoogleAvatar(req, res);
      });
    },
  };
}
