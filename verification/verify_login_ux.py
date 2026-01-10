
from playwright.sync_api import sync_playwright

def verify_login_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the login page
        # Note: The app uses HashRouter, so we might need to be careful with the URL.
        # Based on package.json, homepage is /drlucasduarteclinica
        # and dev server output confirms http://localhost:5173/drlucasduarteclinica/
        page.goto("http://localhost:5173/drlucasduarteclinica/#/login")

        # Wait for the login page content to appear
        page.wait_for_selector("text=Bem-vindo de volta")

        # 1. Verify "Demo Credentials" are buttons and have aria-labels
        medico_btn = page.locator("button[aria-label='Preencher credenciais de Médico']")
        if medico_btn.count() == 1:
             print("✅ 'Médico' demo credential button found with correct aria-label")
        else:
             print("❌ 'Médico' demo credential button NOT found or missing aria-label")

        secretaria_btn = page.locator("button[aria-label='Preencher credenciais de Secretária']")
        if secretaria_btn.count() == 1:
             print("✅ 'Secretária' demo credential button found with correct aria-label")
        else:
             print("❌ 'Secretária' demo credential button NOT found or missing aria-label")

        # 2. Verify Password Toggle has aria-label
        # Initially password is empty and hidden.
        # The aria-label should be "Exibir senha" (Show password) because current type is password (hidden)
        # Note: My code sets "Exibir senha" when !showPassword (which is default false)
        toggle_btn = page.locator("button[aria-label='Exibir senha']")

        if toggle_btn.count() > 0:
            print("✅ Password toggle button found with 'Exibir senha' aria-label")
            # Click it to toggle
            toggle_btn.click()
            # Now it should be "Ocultar senha"
            page.wait_for_selector("button[aria-label='Ocultar senha']")
            print("✅ Password toggle button updated to 'Ocultar senha' after click")
        else:
            print("❌ Password toggle button NOT found with initial aria-label")

        # Take a screenshot
        page.screenshot(path="verification/login_ux_verification_recheck_v2.png")
        print("📸 Screenshot saved to verification/login_ux_verification_recheck_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_login_ux()
