
from playwright.sync_api import sync_playwright, expect
import time

def verify_optimization(page):
    # Navigate to app
    print("Navigating to app...")
    page.goto("http://localhost:5173/drlucasduarteclinica/")

    # Check if we are already logged in or need to login
    # Login page usually has an email input
    try:
        page.wait_for_selector("input[type='email']", timeout=5000)
        print("Logging in...")
        page.fill("input[type='email']", "medico@clinica.com")
        page.fill("input[type='password']", "123456")
        page.click("button[type='submit']")
    except:
        print("Maybe already logged in or different page...")

    # Wait for dashboard
    print("Waiting for dashboard...")
    # Try multiple possible dashboard texts
    try:
        page.wait_for_selector("text=Resumo do Dia", timeout=10000)
    except:
        print("Could not find 'Resumo do Dia'. Trying generic wait...")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/dashboard_debug.png")

    # Navigate to Medical Records via search
    print("Navigating to Medical Records...")
    page.goto("http://localhost:5173/drlucasduarteclinica/#/pacientes")
    page.wait_for_selector("text=Pacientes", timeout=10000)

    # Click "Ver Prontuário" on first patient
    # Using xpath to find the link within the first row actions
    first_record_link = page.locator("a[title='Ver prontuário']").first
    first_record_link.click()

    # Wait for Medical Records page
    page.wait_for_selector("text=Prontuário Médico", timeout=10000)

    # Ensure records list is visible
    page.wait_for_selector("text=Histórico de Atendimentos", timeout=10000)

    # Wait for at least one record card or empty state
    # If there are records, they should have class 'soap-card'
    # If not, empty state text

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/medical_records_optimized.png")
    print("Screenshot saved to verification/medical_records_optimized.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_optimization(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
