// Supabase Edge Function: Telegram Webhook (Deno Runtime)
// Phase 10 will deploy full processing and matching logic

Deno.serve(async (req) => {
  const secret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token')

  if (secret && incomingSecret !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    return new Response(
      JSON.stringify({ ok: true, received: true, update_id: payload.update_id }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
