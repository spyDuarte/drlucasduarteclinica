from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming default Vite port)
            page.goto("http://localhost:5173/drlucasduarteclinica/")

            # Login
            page.fill('input[type="email"]', "medico@clinica.com")
            page.fill('input[type="password"]', "123456")
            page.click('button[type="submit"]')

            # Wait for dashboard
            page.wait_for_selector('h1:has-text("Dr. Lucas Duarte")')

            # Navigate to Patients
            page.click('a[href="/drlucasduarteclinica/pacientes"]')

            # Wait for patients list
            page.wait_for_selector('h1:has-text("Pacientes")')

            # Click "Novo Paciente" to open modal
            page.click('button:has-text("Novo Paciente")')

            # Wait for modal
            page.wait_for_selector('h2:has-text("Novo Paciente")')

            # Take screenshot of the modal to verify it works and validation logic (conceptually)
            page.screenshot(path="verification/patient_modal.png")

            print("Screenshot saved to verification/patient_modal.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
