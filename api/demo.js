const MAX_FIELD_LENGTH = 160;

const json = (response, statusCode, payload) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
};

const clean = (value) =>
  String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FIELD_LENGTH);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const readBody = async (request) => {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Método não permitido." });
  }

  try {
    const body = await readBody(request);

    if (clean(body.website)) {
      return json(response, 200, { ok: true });
    }

    const lead = {
      nome: clean(body.nome),
      empresa: clean(body.empresa),
      cargo: clean(body.cargo),
      email: clean(body.email).toLowerCase(),
      whatsapp: clean(body.whatsapp),
    };

    const requiredFields = Object.entries(lead).filter(([, value]) => !value);
    if (requiredFields.length > 0) {
      return json(response, 400, { error: "Preencha todos os campos obrigatórios." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return json(response, 400, { error: "Informe um e-mail válido." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return json(response, 500, { error: "Envio de e-mail ainda não configurado." });
    }

    const to = process.env.DEMO_TO_EMAIL || "contato@autivis.ai";
    const from = process.env.DEMO_FROM_EMAIL || "AutiVis Health <onboarding@resend.dev>";
    const submittedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const subject = `Nova solicitação de demonstração - ${lead.empresa}`;
    const text = [
      "Nova solicitação de demonstração pela landing page da AutiVis Health.",
      "",
      `Nome: ${lead.nome}`,
      `Empresa: ${lead.empresa}`,
      `Cargo: ${lead.cargo}`,
      `E-mail: ${lead.email}`,
      `WhatsApp: ${lead.whatsapp}`,
      `Data/Hora: ${submittedAt}`,
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; color: #07152f; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Nova solicitação de demonstração</h2>
        <p>Um visitante enviou o formulário da landing page da AutiVis Health.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          <tbody>
            <tr><td style="padding: 8px 0; font-weight: 700;">Nome</td><td>${escapeHtml(lead.nome)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Empresa</td><td>${escapeHtml(lead.empresa)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Cargo</td><td>${escapeHtml(lead.cargo)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">E-mail</td><td>${escapeHtml(lead.email)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">WhatsApp</td><td>${escapeHtml(lead.whatsapp)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Data/Hora</td><td>${escapeHtml(submittedAt)}</td></tr>
          </tbody>
        </table>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: lead.email,
        subject,
        text,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.json().catch(() => ({}));
      console.error("Resend error", errorBody);
      return json(response, 502, {
        error: "Não foi possível enviar sua solicitação agora. Tente novamente em alguns minutos.",
      });
    }

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error("Demo request error", error);
    return json(response, 500, {
      error: "Não foi possível enviar sua solicitação agora. Tente novamente em alguns minutos.",
    });
  }
};
