import re
import pathlib
import os

temp = os.environ.get("TEMP", "/tmp")
for i in range(1, 4):
    p = pathlib.Path(temp) / f"bing{i}.html"
    t = p.read_text(encoding="utf-8", errors="ignore")
    print("====", p.name, "====")
    cites = re.findall(r"<cite[^>]*>(.*?)</cite>", t)
    print("cites", len(cites))
    for c in cites[:20]:
        print(" CITE", re.sub("<[^>]+>", "", c)[:180])
    titles = re.findall(r'<h2[^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', t, re.S)
    print("titles", len(titles))
    for href, title in titles[:20]:
        title = re.sub("<[^>]+>", "", title)
        print(" T", title[:120], "|", href[:180])
    ma = set(re.findall(r"https?://(?:www\.)?milanuncios\.com/[^\s\"'<>]+", t))
    print("ma urls", len(ma))
    for u in list(ma)[:30]:
        print(" U", u[:200])
    print()
