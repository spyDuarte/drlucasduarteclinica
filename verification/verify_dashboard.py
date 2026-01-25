from playwright.sync_api import sync_playwright

def verify_dashboard(page):
    print("Navigating to login page...")
    page.goto("http://localhost:5173/")

    # Wait for login page components to load
    page.wait_for_selector("text=Bem-vindo de volta")

    # Click demo doctor button (it fills email/pass)
    # The button contains text "Médico"
    print("Clicking demo credentials...")
    page.click("button:has-text('Médico')")

    # Click submit button
    print("Logging in...")
    page.click("button:has-text('Acessar Sistema')")

    # Wait for Dashboard to load (look for "Métricas principais" or Welcome Header)
    # WelcomeHeader has "Bom dia" or similar, and "Métricas principais" is in Dashboard.tsx
    print("Waiting for dashboard...")
    page.wait_for_selector("text=Métricas principais", timeout=10000)

    # Take screenshot
    page.screenshot(path="verification/dashboard.png")
    print("Screenshot taken at verification/dashboard.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_dashboard(page)
        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot on error to see what happened
            try:
                page.screenshot(path="verification/error.png")
            except:
                pass
        finally:
            browser.close()
