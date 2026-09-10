import { WorkerMailer } from "worker-mailer";
import validator from "validator";

export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);
    if (url.pathname !== "/api/contact") {
      return env.ASSETS.fetch(req);
    }

    const origin = req.headers.get("Origin");
    const allowedOrigins: string[] = (env.CORS_ORIGINS ?? "")
      .split(";")
      .map((o: string) => o.trim())
      .filter(Boolean);

    const isAllowedOrigin = origin !== null && allowedOrigins.includes(origin);

    // Only ever echo back an origin that is actually on the list. A wildcard
    // here would let any site on the internet POST this form from a visitor's
    // browser. `Vary: Origin` keeps a cache from serving one origin's response
    // to another.
    const corsHeaders: Record<string, string> = {
      Vary: "Origin",
      ...(isAllowedOrigin
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          }
        : {}),
    };

    // A browser always sends Origin on a cross-site POST, so an Origin that is
    // present but not on the list is a cross-site caller: refuse before doing
    // any work, preflight included. A *missing* Origin is a non-browser client
    // (curl, an uptime check), which CORS was never able to police anyway --
    // the honeypot and validation below are what actually guard against abuse.
    if (origin !== null && !isAllowedOrigin) {
      console.log("Rejected request from disallowed origin:", origin);
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // 1. Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      console.log("Method not allowed:", req.method);
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Validate required env vars
    const requiredVars = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "INFO_EMAIL",
      "INFO_NAME",
      "CORS_ORIGINS",
    ];
    for (const key of requiredVars) {
      if (!env[key] || typeof env[key] !== "string" || env[key].trim() === "") {
        console.log(`Missing or invalid env var: ${key}`);
        return new Response("Internal Server Error", {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // 1) Parse, validate & sanitize
    let data: {
      name: string;
      email: string;
      message: string;
      phone?: string;
      ph0ne?: string;
    };
    // Use validator for sanitization and validation
    try {
      data = await req.json();
      if (!data.name || !data.email || !data.message) {
        console.log("Missing fields in request body", data);
        return new Response("Bad Request: Missing required fields", {
          status: 400,
          headers: corsHeaders,
        });
      }
      // Sanitize and validate all user input
      data.name = validator.escape(validator.stripLow(data.name)).trim();
      data.email = validator.normalizeEmail(data.email) || "";
      if (!validator.isEmail(data.email)) {
        console.log("Invalid email address:", data.email);
        return new Response("Bad Request: Invalid email address", {
          status: 400,
          headers: corsHeaders,
        });
      }
      // Only escape and strip low, do not trim, to preserve all newlines
      data.message = validator.escape(validator.stripLow(data.message));
      if (data.phone)
        data.phone = validator.escape(validator.stripLow(data.phone)).trim();
      if (data.ph0ne)
        data.ph0ne = validator.escape(validator.stripLow(data.ph0ne)).trim();
    } catch (err) {
      console.log("Validation error:", err);
      return new Response("Bad Request: Validation error", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (data.ph0ne) {
      console.log("Returned early, received honeypot text", JSON.stringify(data))
      return new Response("OK", {
        headers: corsHeaders,
      });
    }

    // 2) Connect to SMTP (config matches C#) 
    let mailer;
    try {
      mailer = await WorkerMailer.connect({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: false, // false → STARTTLS on 587
        authType: "login",
        credentials: {
          username: env.SMTP_USER,
          password: env.SMTP_PASSWORD,
        },
      });
    } catch (err) {
      console.log("SMTP connect error:", err);
      return new Response("Internal Server Error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 3) Build the MIME message
    const infoEmail = env.INFO_EMAIL;
    const infoName = env.INFO_NAME;
    const phone =
      data.phone && data.phone.trim() ? data.phone : "niet opgegeven";

    // 4) Send
    try {
      await mailer.send({
        from: { name: data.name, email: infoEmail },
        to: [{ name: infoName, email: infoEmail }],
        reply: { name: data.name, email: data.email },
        subject: `Een bericht van ${data.name}`,
        html:
          `<p><b>${data.name}</b> heeft een bericht gestuurd.<br>` +
          `----------------------------------------<br>` +
          `<b>Naam:</b> ${data.name}<br>` +
          `<b>E-mail:</b> ${data.email}<br>` +
          `<b>Telefoonnummer:</b> ${phone}<br>` +
          `----------------------------------------<br>` +
          `<b>Bericht:</b><br><br>` +
          `${data.message.replace(/\r\n|\r|\n/g, '<br>')}<br>`,
      });
    } catch (err) {
      console.log("Send error:", err);
      return new Response("Internal Server Error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 3. Attach CORS on the actual response
    return new Response("OK", {
      headers: corsHeaders,
    });
  },
};
