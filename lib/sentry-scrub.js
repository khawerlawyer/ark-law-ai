// lib/sentry-scrub.js - removes anything private before an error report leaves the app.
// Legal questions, chat text, passwords, cookies, keys and anything after "?" in an
// address (such as shared-chat links) never go to Sentry.
const PRIVATE_KEYS = /pass|token|secret|apikey|api_key|auth|cookie|session|message|content|prompt|history|query/i;
const URL_WITH_QUERY = /((?:https?:\/\/[^\s"'?#]+)|(?:\/[A-Za-z0-9_\-./[\]]*))[?#][^\s"']*/g;

function cutQueries(str) {
  return str.replace(URL_WITH_QUERY, "$1");
}

function scrubDeep(value, depth) {
  if (depth > 8 || value == null) return value;
  if (typeof value === "string") return cutQueries(value);
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, depth + 1));
  if (typeof value === "object") {
    for (const k of Object.keys(value)) {
      // keep the error text itself readable; only addresses inside it are trimmed
      if (PRIVATE_KEYS.test(k) && !["message", "logentry"].includes(k) && depth > 0) value[k] = "[removed]";
      else value[k] = scrubDeep(value[k], depth + 1);
    }
  }
  return value;
}

export function scrubEvent(event) {
  if (event.request) {
    delete event.request.data;         // request bodies (chat messages, sign-in forms)
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.headers) {
      const keep = {};
      for (const h of ["user-agent", "referer", "content-type"]) {
        if (event.request.headers[h]) keep[h] = event.request.headers[h];
      }
      event.request.headers = keep;
    }
  }
  if (event.user) event.user = event.user.id ? { id: event.user.id } : {};
  return scrubDeep(event, 0);
}

export function scrubTransaction(event) {
  return scrubEvent(event);
}
