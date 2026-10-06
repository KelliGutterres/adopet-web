"""Captura telas do painel web para o manual de testes."""
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent / "imagens"
OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:5173"


def shot(page, name):
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / name), full_page=False)
    print("ok", name)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        page.goto(f"{BASE}/login", wait_until="networkidle")
        shot(page, "web-01-login.png")

        page.goto(f"{BASE}/cadastro", wait_until="networkidle")
        shot(page, "web-02-cadastro.png")

        page.goto(f"{BASE}/esqueci-senha", wait_until="networkidle")
        shot(page, "web-03-esqueci-senha.png")

        page.goto(f"{BASE}/login", wait_until="networkidle")
        page.fill("#email", "email-invalido")
        page.fill("#senha", "123")
        page.get_by_role("button", name="Entrar").click()
        page.wait_for_timeout(300)
        shot(page, "web-04-login-erro.png")

        page.fill("#email", "ong@adopet.local")
        page.fill("#senha", "senha123")
        page.get_by_role("button", name="Entrar").click()
        page.wait_for_url("**/painel/**", wait_until="commit", timeout=15000)
        page.get_by_role("heading", name="Animais para Adoção").wait_for(timeout=15000)
        page.wait_for_timeout(800)
        shot(page, "web-05-lista-adocao.png")

        page.goto(f"{BASE}/painel/dashboard", wait_until="networkidle")
        page.wait_for_timeout(800)
        shot(page, "web-06-dashboard.png")

        page.goto(f"{BASE}/painel/animais/encontrados", wait_until="networkidle")
        page.wait_for_timeout(600)
        shot(page, "web-07-lista-encontrados.png")

        page.goto(f"{BASE}/painel/animais/perdidos", wait_until="networkidle")
        page.wait_for_timeout(600)
        shot(page, "web-08-lista-perdidos.png")

        page.goto(f"{BASE}/painel/animais/adocao", wait_until="networkidle")
        page.wait_for_timeout(600)
        page.get_by_role("button", name="Ver detalhes").first.click()
        page.get_by_role("heading", name="Detalhes do animal").wait_for(timeout=10000)
        page.wait_for_timeout(600)
        shot(page, "web-09-detalhe.png")

        page.goto(f"{BASE}/painel/animais/novo?status=A", wait_until="networkidle")
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "web-10-cadastro-animal.png"), full_page=True)
        print("ok", "web-10-cadastro-animal.png")

        page.goto(f"{BASE}/painel/usuarios", wait_until="networkidle")
        page.get_by_role("heading", name="Usuários").wait_for(timeout=10000)
        page.locator("#busca-usuario, input[placeholder*='Buscar por nome']").first.fill("Usuario Demo")
        page.wait_for_timeout(400)
        shot(page, "web-11-usuarios.png")

        page.goto(f"{BASE}/painel/animais/adocao", wait_until="networkidle")
        page.get_by_role("button", name="Excluir").first.click()
        page.get_by_role("button", name="Cancelar").wait_for(timeout=8000)
        page.wait_for_timeout(300)
        shot(page, "web-14-excluir.png")
        page.get_by_role("button", name="Cancelar").click()

        page.goto(f"{BASE}/painel/ong", wait_until="networkidle")
        page.wait_for_timeout(700)
        shot(page, "web-12-perfil-ong.png")

        page.goto(f"{BASE}/painel/similaridade", wait_until="networkidle")
        page.wait_for_timeout(500)
        shot(page, "web-13-busca-foto.png")

        browser.close()


if __name__ == "__main__":
    main()
