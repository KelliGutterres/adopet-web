"""Captura telas do app (Expo web, viewport de celular) para o manual."""
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent / "imagens"
OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://127.0.0.1:8081"


def shot(page, name, tall=False):
    if tall:
        page.set_viewport_size({"width": 390, "height": 1280})
    page.wait_for_timeout(600)
    page.screenshot(path=str(OUT / name), full_page=False)
    if tall:
        page.set_viewport_size({"width": 390, "height": 844})
    print("ok", name)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
        )

        page.goto(BASE, wait_until="domcontentloaded", timeout=120000)
        page.get_by_text("Bem-vindo de volta!").first.wait_for(timeout=60000)
        shot(page, "mob-01-login.png")

        page.get_by_text("Cadastre-se", exact=True).click()
        page.get_by_text("Crie sua conta").wait_for(timeout=10000)
        shot(page, "mob-02-cadastro.png", tall=True)

        page.goto(BASE, wait_until="domcontentloaded")
        page.get_by_text("Bem-vindo de volta!").first.wait_for(timeout=20000)
        page.get_by_text("Esqueceu sua senha?").click()
        page.get_by_text("Esqueceu a senha?").wait_for(timeout=10000)
        shot(page, "mob-03-esqueci-senha.png", tall=True)

        page.goto(BASE, wait_until="domcontentloaded")
        page.get_by_text("Bem-vindo de volta!").first.wait_for(timeout=20000)
        page.get_by_placeholder("Digite seu e-mail").fill("email-invalido")
        page.get_by_placeholder("Digite sua senha").fill("123")
        page.get_by_role("button", name="Entrar").click()
        page.get_by_text("Informe um e-mail válido").wait_for(timeout=8000)
        shot(page, "mob-04-login-erro.png")

        page.get_by_placeholder("Digite seu e-mail").fill("usuario@adopet.local")
        page.get_by_placeholder("Digite sua senha").fill("senha123")
        page.get_by_role("button", name="Entrar").click()
        page.get_by_text("Animais para Adoção").wait_for(timeout=20000)
        page.wait_for_timeout(900)
        shot(page, "mob-05-adocao.png")

        page.get_by_role("button", name="Perdidos").click()
        page.get_by_text("Animais Perdidos").first.wait_for(timeout=10000)
        page.wait_for_timeout(800)
        shot(page, "mob-06-perdidos.png")

        page.get_by_role("button", name="Encontrados").click()
        page.get_by_text("Animais Encontrados").first.wait_for(timeout=10000)
        page.wait_for_timeout(800)
        shot(page, "mob-07-encontrados.png")

        page.get_by_role("button", name="Cadastrar animal").click()
        page.get_by_text("O animal foi encontrado ou está perdido?").wait_for(timeout=10000)
        shot(page, "mob-08-escolher-status.png")

        page.get_by_role("button", name="Perdi um animal").click()
        page.get_by_text("Cadastrar animal perdido").wait_for(timeout=10000)
        shot(page, "mob-09-form-perdido.png", tall=True)

        page.go_back()
        page.get_by_text("O animal foi encontrado ou está perdido?").wait_for(timeout=10000)
        page.go_back()
        page.get_by_role("button", name="Adoção").click()
        page.get_by_text("Animais para Adoção").wait_for(timeout=10000)
        page.get_by_text("Thor", exact=True).first.click()
        page.get_by_text("Detalhes", exact=True).wait_for(timeout=10000)
        page.wait_for_timeout(700)
        shot(page, "mob-10-detalhe.png", tall=True)

        page.go_back()
        page.get_by_text("Animais para Adoção").wait_for(timeout=10000)
        page.get_by_role("button", name="Perfil").click()
        page.get_by_text("Meus animais").wait_for(timeout=10000)
        shot(page, "mob-11-perfil.png", tall=True)

        page.get_by_role("button", name="Meus animais").click()
        page.get_by_text("Meus animais").wait_for(timeout=10000)
        page.wait_for_timeout(800)
        shot(page, "mob-12-meus-animais.png")

        page.go_back()
        page.get_by_role("button", name="Perfil").wait_for(timeout=10000)
        page.go_back()
        page.get_by_role("button", name="Busca por Foto").click()
        page.get_by_role("button", name="Buscar por foto").wait_for(timeout=10000)
        shot(page, "mob-13-busca-foto.png")

        browser.close()


if __name__ == "__main__":
    main()
