from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to login
        print("Navigating to login...")
        page.goto("http://localhost:5173/drlucasduarteclinica/#/login")

        # Login
        print("Logging in...")
        page.get_by_placeholder("seu@email.com").fill("medico@clinica.com")
        page.get_by_placeholder("••••••••").fill("123456")
        page.get_by_role("button", name="Acessar Sistema").click()

        # Wait for dashboard
        print("Waiting for dashboard...")
        # Since it's a SPA, we wait for URL change or a specific element
        page.wait_for_url("**/dashboard")

        # Search for a patient
        print("Searching...")
        search_input = page.get_by_placeholder("Buscar pacientes...")
        search_input.fill("Maria")

        # Wait for results
        # Assuming "Maria" is in the demo data.
        page.wait_for_selector("text=Maria Fernanda Lima", timeout=5000)

        time.sleep(0.5) # Wait for debounce (300ms) + render

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/search_results.png")

        browser.close()

if __name__ == "__main__":
    run()
