
from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_dashboard_stats(page: Page):
    # 1. Arrange: Go to the Login page.
    page.goto("http://localhost:5173/")

    # 2. Act: Click Demo Credential for Medico
    page.get_by_text("Médico", exact=True).click()

    # 3. Act: Click Login button "Acessar Sistema"
    page.get_by_role("button", name="Acessar Sistema").click()

    # 4. Assert: Wait for Dashboard to load.
    # Look for "Métricas principais" which is in Dashboard.tsx
    expect(page.get_by_text("Métricas principais")).to_be_visible()

    # Verify Stats cards are visible
    expect(page.get_by_text("Consultas Hoje")).to_be_visible()
    expect(page.get_by_text("Pacientes Total")).to_be_visible()
    expect(page.get_by_text("Receita do Mês")).to_be_visible()

    # Wait a bit for animations
    time.sleep(2)

    # 5. Screenshot
    page.screenshot(path="verification/dashboard_stats.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard_stats(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="verification/error.png")
            raise
        finally:
            browser.close()
