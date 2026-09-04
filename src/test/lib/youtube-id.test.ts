import { describe, expect, it } from "vitest";
import {
  extractYoutubeId,
  isYoutubeId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "@/lib/youtubeId";

const ID = "dQw4w9WgXcQ";

describe("extractYoutubeId", () => {
  it("acepta un id suelto", () => {
    expect(extractYoutubeId(ID)).toBe(ID);
    expect(extractYoutubeId(`  ${ID}  `)).toBe(ID);
  });

  it("extrae de las formas de URL habituales", () => {
    expect(extractYoutubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(extractYoutubeId(`https://youtu.be/${ID}`)).toBe(ID);
    expect(extractYoutubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(extractYoutubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(extractYoutubeId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(extractYoutubeId(`https://www.youtube-nocookie.com/embed/${ID}`)).toBe(ID);
  });

  it("ignora parametros extra y marcas de tiempo", () => {
    expect(extractYoutubeId(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PLabc`)).toBe(ID);
    expect(extractYoutubeId(`https://youtu.be/${ID}?t=42`)).toBe(ID);
  });

  it("tolera URL sin esquema", () => {
    expect(extractYoutubeId(`youtu.be/${ID}`)).toBe(ID);
    expect(extractYoutubeId(`www.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("rechaza lo que no es YouTube o no es un id valido", () => {
    expect(extractYoutubeId("https://vimeo.com/123456")).toBeNull();
    expect(extractYoutubeId("https://www.youtube.com/watch?v=corto")).toBeNull();
    expect(extractYoutubeId("https://www.youtube.com/results?search_query=squat")).toBeNull();
    expect(extractYoutubeId("no es una url")).toBeNull();
    expect(extractYoutubeId("")).toBeNull();
    expect(extractYoutubeId(null)).toBeNull();
    expect(extractYoutubeId(42)).toBeNull();
  });

  it("no acepta un host que solo contenga el dominio de YouTube", () => {
    expect(extractYoutubeId(`https://youtube.com.evil.test/watch?v=${ID}`)).toBeNull();
  });
});

describe("isYoutubeId", () => {
  it("valida la longitud exacta de 11 caracteres", () => {
    expect(isYoutubeId(ID)).toBe(true);
    expect(isYoutubeId("short")).toBe(false);
    expect(isYoutubeId(`${ID}extra`)).toBe(false);
    expect(isYoutubeId(null)).toBe(false);
  });
});

describe("urls derivadas", () => {
  it("construye miniatura y embed sin cookies", () => {
    expect(youtubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
    expect(youtubeThumbnailUrl(ID, "maxresdefault")).toContain("maxresdefault.jpg");

    const embed = youtubeEmbedUrl(ID);
    expect(embed).toContain("youtube-nocookie.com/embed/" + ID);
    expect(embed).toContain("autoplay=1");
    expect(embed).toContain("playsinline=1");
  });
});
