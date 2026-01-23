import re
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to Dashboard...")
        # Use hash router URL
        page.goto("http://localhost:5173/drlucasduarteclinica/#/")

        # 1. Login
        print("Logging in...")
        # Use a more generic name match or partial text since the button contains multiple text nodes
        page.get_by_text("Médico", exact=True).click()
        page.get_by_role("button", name="Acessar Sistema").click()
        # Verify dashboard loaded by checking for user name in header
        # Check for static welcome text to avoid strict mode violations with user name appearing multiple times
        expect(page.get_by_text("Bem-vindo ao seu painel")).to_be_visible()

        # 2. Verify Agenda Modal
        print("Verifying Agenda Modal...")
        page.click("text=Agenda")
        expect(page).to_have_url(re.compile(r".*/agenda"))

        # Click "Nova Consulta" - specific locator to avoid strict mode violation if multiple exist
        # We target the primary action button, usually usually distinct.
        # If there are two, we'll take the first visible one or use a more specific selector.
        # The previous error said "resolved to 2 elements". One might be in the header, one in the body?
        # Let's use the button role specifically.
        nova_consulta_btn = page.get_by_role("button", name="Nova Consulta").first
        nova_consulta_btn.click()

        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_role("heading", name="Nova Consulta")).to_be_visible()

        # Check if constants are loaded (e.g. Type selector has options)
        # The type selector is implemented as buttons in a grid, so we check for the button text
        # Check for "Primeira Consulta" which comes from constants
        expect(page.get_by_role("button", name="Primeira Consulta")).to_be_visible()
        # Close modal
        page.get_by_role("dialog").get_by_label("Fechar").click()
        expect(page.get_by_role("dialog")).to_be_hidden()

        # 3. Verify Medical Record Modal (via Patients)
        print("Verifying Medical Record Modal...")
        page.click("text=Pacientes")
        expect(page).to_have_url(re.compile(r".*/pacientes"))

        # Wait for the table to load
        expect(page.get_by_text("João Carlos Santos")).to_be_visible()

        # Click "Ver Prontuário" for the first patient.
        # The icon is FileText. The row contains the name.
        # We can find the row with "João Carlos Santos" and click the button inside it.
        # Or just the first "Ver Prontuário" button/link.
        # Based on previous knowledge, it's a button/link that navigates.

        # Attempt to click the first patient's name or action.
        # The screenshot shows "João Carlos Santos".
        # Let's click the patient name to navigate? Or the action button.
        # In the previous run, I used 'get_by_role("button", name="Ver prontuário").first'.
        # Let's try that again.

        # Using a more robust selector for the action button
        # Assuming the button has an aria-label or text "Ver prontuário"
        # If it's an icon only, we might need a selector based on the icon class or parent.
        # But let's try text first as it worked partially before.

        # Actually, in the screenshot of the failure, we were ON the patient page.
        # So the click worked.
        # The issue was the assertion.

        # Locate the row for João
        row = page.get_by_role("row", name="João Carlos Santos")
        # Click the "Ver Prontuário" button in that row.
        # If it's an icon, it might have title="Ver Prontuário"

        # Let's rely on the text "João Carlos Santos" being clickable or having a sibling button.
        # In Patients.tsx:
        # <button onClick={() => navigate(`/pacientes/${patient.id}`)} ... title="Ver Prontuário">

        page.get_by_title("Ver Prontuário").first.click()

        # Wait for navigation
        # Use re.compile for regex URL matching
        expect(page).to_have_url(re.compile(r".*/pacientes/\d+"))

        # Check for Medical Record elements
        expect(page.get_by_text("Prontuário Médico")).to_be_visible()
        expect(page.get_by_role("heading", name="João Carlos Santos").first).to_be_visible()

        print("Verification Successful!")
        browser.close()

if __name__ == "__main__":
    run()
