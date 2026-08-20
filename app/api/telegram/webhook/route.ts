import { NextRequest, NextResponse } from 'next/server'
import { telegramWebhookUpdateSchema } from '@/lib/validations/telegram'

/**
 * Telegram Webhook Handler (Route Handler / Serverless Endpoint)
 * Verified against X-Telegram-Bot-Api-Secret-Token for security.
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
    const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token')

    // 1. Verify webhook secret if configured
    if (webhookSecret && incomingSecret !== webhookSecret) {
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
        { error: 'Invalid Telegram payload structure', details: parseResult.error.format() },
        { status: 400 }
      )
    }

    const update = parseResult.data

    // 3. Acknowledge receipt to Telegram (Webhook processing logic will be hooked in Phase 10)
    return NextResponse.json({
      ok: true,
      update_id: update.update_id,
      status: 'received',
    })
  } catch (error) {
    console.error('Error handling Telegram webhook:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'GravityCRM Telegram Webhook Endpoint',
  })
}
