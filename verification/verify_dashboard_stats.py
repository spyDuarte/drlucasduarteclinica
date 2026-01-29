from playwright.sync_api import sync_playwright
import time

def verify_dashboard_stats(page):
    page.goto("http://localhost:5173/")
    time.sleep(2)

    if page.get_by_text("Bem-vindo de volta").is_visible():
        print("Login page detected. Attempting login...")
        page.locator('input[type="email"]').fill("medico@clinica.com")
        page.locator('input[type="password"]').fill("123456")
        page.get_by_role("button", name="Acessar Sistema").click()
        print("Clicked login button.")

    print("Waiting for dashboard...")
    # Wait for "MÉTRICAS PRINCIPAIS"
    page.wait_for_selector("text=MÉTRICAS PRINCIPAIS", timeout=10000)

    page.wait_for_timeout(2000)

    page.screenshot(path="verification/dashboard_stats.png")
    print("Screenshot taken: verification/dashboard_stats.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard_stats(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
