export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const email = formData.get('email');
  const token = formData.get('cf-turnstile-response');

  if (!email || !token) {
    return new Response('Missing fields', { status: 400 });
  }

  // Verify Turnstile
  const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: context.env.TURNSTILE_SECRET,
      response: token,
      remoteip: context.request.headers.get('CF-Connecting-IP'),
    }),
  });

  const turnstileData = await turnstileRes.json();

  if (!turnstileData.success) {
    return new Response('Verification failed', { status: 403 });
  }

  // Log for now. Wire up KV or email forwarding later.
  console.log(`Pev_ExpenseOS waitlist: ${email}`);

  return new Response('OK', { status: 200 });
}
