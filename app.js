const toggle = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-nav-menu]");
const header = document.querySelector("[data-header]");
const demoModal = document.querySelector("[data-demo-modal]");
const demoForm = document.querySelector("[data-demo-form]");
const demoStatus = document.querySelector("[data-demo-status]");
const demoOpenButtons = document.querySelectorAll("[data-demo-open]");
const demoCloseButtons = document.querySelectorAll("[data-demo-close]");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    }
  });
}

if (header) {
  const setHeaderState = () => {
    header.classList.toggle("has-shadow", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

const openDemoModal = () => {
  if (!demoModal) return;

  demoModal.hidden = false;
  demoModal.scrollTop = 0;
  if (demoStatus) {
    demoStatus.textContent = "";
    delete demoStatus.dataset.state;
  }
  document.body.classList.add("modal-open");
  const firstInput = demoModal.querySelector("input");
  firstInput?.focus();
};

const closeDemoModal = () => {
  if (!demoModal) return;

  demoModal.hidden = true;
  document.body.classList.remove("modal-open");
};

demoOpenButtons.forEach((button) => {
  button.addEventListener("click", openDemoModal);
});

demoCloseButtons.forEach((button) => {
  button.addEventListener("click", closeDemoModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && demoModal && !demoModal.hidden) {
    closeDemoModal();
  }
});

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(demoForm);
  const submitButton = demoForm.querySelector("button[type='submit']");

  const payload = {
    nome: String(data.get("nome") || "").trim(),
    empresa: String(data.get("empresa") || "").trim(),
    cargo: String(data.get("cargo") || "").trim(),
    email: String(data.get("email") || "").trim(),
    whatsapp: String(data.get("whatsapp") || "").trim(),
    website: String(data.get("website") || "").trim(),
  };

  const setStatus = (message, type) => {
    if (!demoStatus) return;
    demoStatus.textContent = message;
    demoStatus.dataset.state = type;
  };

  const submit = async () => {
    submitButton?.setAttribute("disabled", "true");
    setStatus("Enviando sua solicitação...", "loading");

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível enviar sua solicitação agora.");
      }

      demoForm.reset();
      setStatus("Solicitação enviada. Entraremos em contato em breve.", "success");
    } catch (error) {
      setStatus(error.message || "Não foi possível enviar sua solicitação agora.", "error");
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  };

  submit();
});
