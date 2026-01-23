import time
from playwright.sync_api import sync_playwright

def verify_vitals(page):
    page.set_viewport_size({"width": 1280, "height": 900})
    print("Navigating to login...")
    page.goto("http://localhost:5173/drlucasduarteclinica/")

    # Login
    print("Logging in...")
    page.locator('input[type="email"]').fill("medico@clinica.com")
    page.locator('input[type="password"]').fill("123456")
    page.get_by_role("button", name="Acessar Sistema").click()

    # Wait for dashboard
    page.wait_for_url("**/dashboard")
    print("Logged in.")

    # Go to Patients
    print("Navigating to patients...")
    page.goto("http://localhost:5173/drlucasduarteclinica/#/pacientes")

    # Wait for table
    print("Waiting for table...")
    page.wait_for_selector("tbody tr", timeout=10000)

    # Click the first "Ver prontuário" button (FileText icon)
    # In Patients.tsx, it's a Link with title="Ver prontuário"
    print("Opening patient dashboard...")
    page.locator("a[title='Ver prontuário']").first.click()

    # Wait for MedicalRecords page
    print("Waiting for patient dashboard...")
    page.wait_for_selector("text=Histórico de Atendimentos", timeout=10000)

    # Click "Novo Atendimento" (in quick actions or empty state)
    print("Clicking 'Novo Atendimento'...")
    # There might be an empty state button if no records
    if page.get_by_text("Nenhum atendimento registrado").is_visible():
         page.get_by_role("button", name="Criar atendimento").click()
    else:
         # Try the "Ações Rápidas" -> "Novo Atendimento" or if there is a direct button
         # In index.tsx, "Ações Rápidas" is a button.
         page.get_by_role("button", name="Ações Rápidas").click()
         page.get_by_text("Novo Atendimento").click()

    # Wait for MedicalRecordModal
    print("Waiting for modal...")
    page.wait_for_selector("text=Novo Atendimento", timeout=10000)

    # Click on "Objetivo" tab
    print("Clicking 'Objetivo'...")
    page.get_by_text("Objetivo (O)").click()

    # Wait for content
    print("Waiting for vital signs...")
    page.wait_for_selector("text=Sinais Vitais", timeout=10000)

    # Take screenshot
    print("Taking screenshot...")
    time.sleep(2) # Wait for animation
    page.screenshot(path="/home/jules/verification/vitals_after.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_vitals(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
