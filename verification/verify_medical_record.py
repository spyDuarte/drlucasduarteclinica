from playwright.sync_api import sync_playwright
import time

def verify_medical_record_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Login
        page.goto("http://localhost:5173/drlucasduarteclinica/")

        # Login
        page.fill("input[type='email']", "medico@clinica.com")
        page.fill("input[type='password']", "123456")
        page.click("button[type='submit']")

        # Wait for dashboard
        page.wait_for_selector("text=Dr. Lucas Duarte", timeout=15000)

        # Navigate directly to Patient 1 Medical Records
        page.goto("http://localhost:5173/drlucasduarteclinica/#/pacientes/1")

        # Wait for patient details page - look for patient name or "Prontuário Médico"
        page.wait_for_selector("text=Prontuário Médico", timeout=15000)

        # Need to open Quick Actions first maybe?
        # In index.tsx: "Ações Rápidas" button opens dropdown with "Novo Atendimento"
        # Or check if there is a direct button?
        # Looking at index.tsx:
        # <button className="btn-primary flex items-center gap-2" onClick={() => setShowQuickActions(!showQuickActions)}>Ações Rápidas...</button>
        # And inside dropdown: <button onClick={() => handleQuickAction('atendimento')}>Novo Atendimento</button>

        # Also there is an Empty State if no records:
        # <button onClick={onCreateNew}>Criar atendimento</button> (text: "Criar atendimento")

        # Let's try to find either "Ações Rápidas" or "Criar atendimento"
        if page.is_visible("text=Ações Rápidas"):
            page.click("text=Ações Rápidas")
            page.wait_for_selector("text=Novo Atendimento")
            page.click("text=Novo Atendimento")
        elif page.is_visible("text=Criar atendimento"):
            page.click("text=Criar atendimento")
        else:
            print("Could not find button to create new record")
            page.screenshot(path="verification/failed_find_button.png")
            browser.close()
            return

        # Wait for Modal content
        # We added "Histórico Clínico e Evolução" and "Lista de Problemas"
        page.wait_for_selector("text=Histórico Clínico e Evolução", timeout=15000)

        # Verify Problem List section
        page.wait_for_selector("text=Lista de Problemas", timeout=5000)

        # Scroll to top to ensure sections are visible for screenshot
        page.evaluate("document.querySelector('form.overflow-y-auto').scrollTop = 0")

        time.sleep(1)
        page.screenshot(path="verification/medical_record_modal.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    verify_medical_record_modal()
