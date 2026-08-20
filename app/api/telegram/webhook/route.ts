import { NextRequest, NextResponse } from 'next/server'
import { telegramWebhookUpdateSchema } from '@/lib/validations/telegram'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Telegram Webhook Handler (Route Handler)
 * Features:
 * - X-Telegram-Bot-Api-Secret-Token validation
 * - Idempotency deduplication via telegram_updates_log
 * - Automatic client resolution (by telegram_id or username)
 * - Auto-creation of new LEAD if sender is unknown
 * - Communication logging (channel: TELEGRAM, direction: INCOMING)
 * - Automatic update of clients.last_contact_at
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
    const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token')

    // 1. Verify Secret Token
    if (webhookSecret && incomingSecret !== webhookSecret) {
      console.warn('[Telegram Webhook] Unauthorized request: secret token mismatch')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Telegram Secret Token' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 2. Validate payload structure
    const parseResult = telegramWebhookUpdateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid Telegram payload structure', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const update = parseResult.data
    const supabase = createAdminClient()

    // 3. Idempotency Check (telegram_updates_log)
    const { data: existingLog } = await supabase
      .from('telegram_updates_log')
      .select('update_id')
      .eq('update_id', update.update_id)
      .single()

    if (existingLog) {
      // Already processed update - respond 200 OK immediately
      return NextResponse.json({
        ok: true,
        update_id: update.update_id,
        status: 'duplicate_skipped',
      })
    }

    // Log update_id to prevent duplicates
    await supabase.from('telegram_updates_log').insert({
      update_id: update.update_id,
      status: 'processing',
    })

    // 4. Extract Message Content & Sender
    const msg = update.message || update.edited_message || update.channel_post
    if (!msg || !msg.from) {
      await supabase
        .from('telegram_updates_log')
        .update({ status: 'ignored_no_sender' })
        .eq('update_id', update.update_id)

      return NextResponse.json({
        ok: true,
        update_id: update.update_id,
        status: 'ignored_no_sender',
      })
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

      return NextResponse.json({
        ok: true,
        update_id: update.update_id,
        status: 'ignored_empty_text',
      })
    }

    const fullName =
      [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim() ||
      username ||
      `Telegram User #${telegramId}`

    // 5. Determine Owner ID
    let ownerId = process.env.DEFAULT_OWNER_ID
    if (!ownerId) {
      // Pick first user from clients or auth
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

      // Update client: last_contact_at, and username/telegram_id if missing
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
      console.error('[Telegram Webhook] Error saving communication log:', logError)
    }

    // 8. Mark update as completed
    await supabase
      .from('telegram_updates_log')
      .update({ status: 'completed' })
      .eq('update_id', update.update_id)

    return NextResponse.json({
      ok: true,
      update_id: update.update_id,
      client_id: clientId,
      is_new_lead: !clientRecord,
      status: 'success',
    })
  } catch (error: any) {
    console.error('[Telegram Webhook] Execution error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'GravityCRM Telegram Webhook Route Handler',
    secret_configured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
    service_role_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    timestamp: new Date().toISOString(),
  })
}
