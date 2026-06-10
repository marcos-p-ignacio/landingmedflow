const toggle = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-nav-menu]");
const header = document.querySelector("[data-header]");
const demoModal = document.querySelector("[data-demo-modal]");
const demoForm = document.querySelector("[data-demo-form]");
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
  const nome = String(data.get("nome") || "").trim();
  const empresa = String(data.get("empresa") || "").trim();
  const cargo = String(data.get("cargo") || "").trim();
  const email = String(data.get("email") || "").trim();
  const whatsapp = String(data.get("whatsapp") || "").trim();

  const subject = "Solicitação de demonstração MedFlow";
  const body = [
    "Olá, equipe MedFlow.",
    "",
    "Tenho interesse em uma demonstração da plataforma.",
    "",
    `Nome: ${nome}`,
    `Empresa: ${empresa}`,
    `Cargo: ${cargo}`,
    `E-mail: ${email}`,
    `WhatsApp: ${whatsapp}`,
    "",
    "Obrigado.",
  ].join("\n");

  window.location.href = `mailto:contato@medflow.ia.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  closeDemoModal();
});
