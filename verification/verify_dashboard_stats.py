
import time
from playwright.sync_api import sync_playwright, expect

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Login
            print("Navigating to login...")
            page.goto("http://localhost:5173/#/login")

            # Use demo credentials
            print("Filling credentials...")
            page.fill('input[type="email"]', 'medico@clinica.com')
            page.fill('input[type="password"]', '123456')

            print("Clicking login...")
            page.click('button[type="submit"]')

            # Wait for dashboard
            print("Waiting for dashboard...")
            # Relaxed URL check
            page.wait_for_url("**/dashboard", timeout=10000)
            print(f"Landed on: {page.url}")

            # 2. Verify Stats
            # We expect to see stats cards.
            expect(page.get_by_text("Consultas Hoje")).to_be_visible()

            # Take screenshot of the dashboard
            print("Taking screenshot...")
            # Wait a bit for animations
            time.sleep(2)
            page.screenshot(path="verification/dashboard_stats.png", full_page=True)
            print("Screenshot saved to verification/dashboard_stats.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run_test()
