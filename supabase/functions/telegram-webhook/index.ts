// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs on Supabase Edge Functions (Deno runtime).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TelegramUser {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat?: {
    id: number
    first_name?: string
    last_name?: string
    username?: string
    type?: string
    title?: string
  }
  date?: number
  text?: string
  caption?: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  channel_post?: TelegramMessage
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') || ''
    const defaultOwnerId = Deno.env.get('DEFAULT_OWNER_ID') || ''

    // 1. Validate Webhook Secret Header
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token')
    if (webhookSecret && incomingSecret !== webhookSecret) {
      console.warn('Unauthorized: Webhook secret mismatch')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid Secret Token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Parse Incoming Telegram Update
    const update: TelegramUpdate = await req.json()

    if (!update || typeof update.update_id !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Missing update_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Idempotency Check (telegram_updates_log)
    const { data: existingLog } = await supabase
      .from('telegram_updates_log')
      .select('update_id')
      .eq('update_id', update.update_id)
      .single()

    if (existingLog) {
      // Already processed update - respond 200 OK immediately
      return new Response(
        JSON.stringify({ ok: true, status: 'duplicate_skipped' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log update_id to prevent duplicates
    await supabase.from('telegram_updates_log').insert({
      update_id: update.update_id,
      status: 'processing',
    })

    // 4. Extract Message Content and Sender
    const msg = update.message || update.edited_message || update.channel_post
    if (!msg || !msg.from) {
      await supabase
        .from('telegram_updates_log')
        .update({ status: 'ignored_no_sender' })
        .eq('update_id', update.update_id)

      return new Response(
        JSON.stringify({ ok: true, status: 'ignored_no_sender' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sender = msg.from
    const telegramId = sender.id
    const username = sender.username ? sender.username.replace(/^@/, '').trim() : null
    const messageText = (msg.text || msg.caption || '').trim()

    if (!messageText) {
      await supabase
        .from('telegram_updates_log')
        .update({ status: 'ignored_empty_text' })
        .eq('update_id', update.update_id)

      return new Response(
        JSON.stringify({ ok: true, status: 'ignored_empty_text' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fullName =
      [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim() ||
      username ||
      `Telegram User #${telegramId}`

    // 5. Determine Owner ID
    let ownerId = defaultOwnerId
    if (!ownerId) {
      // Find first user from auth.users or clients
      const { data: firstClient } = await supabase
        .from('clients')
        .select('owner_id')
        .limit(1)
        .single()

      if (firstClient?.owner_id) {
        ownerId = firstClient.owner_id
      } else {
        const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
        if (usersData?.users?.[0]?.id) {
          ownerId = usersData.users[0].id
        }
      }
    }

    if (!ownerId) {
      throw new Error('No owner_id found to assign incoming Telegram client')
    }

    const now = new Date().toISOString()

    // 6. Match or Create Client
    let clientRecord = null

    // Match by telegram_id first
    const { data: clientById } = await supabase
      .from('clients')
      .select('id, owner_id, username, full_name')
      .eq('telegram_id', telegramId)
      .single()

    if (clientById) {
      clientRecord = clientById
    } else if (username) {
      // Match by username
      const { data: clientByUsername } = await supabase
        .from('clients')
        .select('id, owner_id, username, full_name')
        .ilike('username', username)
        .single()

      if (clientByUsername) {
        clientRecord = clientByUsername
      }
    }

    let clientId: string

    if (clientRecord) {
      clientId = clientRecord.id
      ownerId = clientRecord.owner_id

      // Update client info (last_contact_at, username if updated, telegram_id)
      await supabase
        .from('clients')
        .update({
          last_contact_at: now,
          telegram_id: telegramId,
          ...(username && !clientRecord.username ? { username } : {}),
        })
        .eq('id', clientId)
    } else {
      // Create new Lead from Telegram
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          owner_id: ownerId,
          full_name: fullName,
          username: username,
          telegram_id: telegramId,
          source: 'TELEGRAM',
          status: 'LEAD',
          notes: `Створено автоматично через Telegram Bot Webhook (${now})`,
          last_contact_at: now,
        })
        .select('id')
        .single()

      if (createError || !newClient) {
        throw new Error(createError?.message || 'Failed to auto-create client lead')
      }

      clientId = newClient.id
    }

    // 7. Log Communication Message (channel: TELEGRAM, direction: INCOMING)
    const { error: logError } = await supabase.from('communication_log').insert({
      owner_id: ownerId,
      client_id: clientId,
      channel: 'TELEGRAM',
      direction: 'INCOMING',
      message: messageText,
      created_at: now,
    })

    if (logError) {
      console.error('Error saving communication log:', logError)
    }

    // 8. Mark update as processed
    await supabase
      .from('telegram_updates_log')
      .update({ status: 'completed' })
      .eq('update_id', update.update_id)

    return new Response(
      JSON.stringify({
        ok: true,
        client_id: clientId,
        is_new_lead: !clientRecord,
        status: 'success',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Telegram Webhook Handler Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
