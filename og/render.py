# Renders og/og.html to site/og-en.png and site/og-ru.png (1200×630). Run from the repo root: python3 og/render.py
import pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path('og/og.html').resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    for lang in ('en', 'ru'):
        pg.goto(f'{src}?lang={lang}'); pg.wait_for_load_state('networkidle'); pg.evaluate('document.fonts.ready')
        pg.screenshot(path=f'site/og-{lang}.png')
    b.close()
