import process from 'node:process'
import { Markup, Telegraf } from 'telegraf'
import consola from 'consola'
import { message } from 'telegraf/filters'
import { db } from '@ntm-connect/shared/database'
import { subscribedUsers } from '@ntm-connect/shared/database.schema'
import { eq, sql } from 'drizzle-orm'
import { env } from './config.js'

const bot = new Telegraf(env.TELEGRAM_BOT_KEY)

interface isUserSubscribedResponse {
  isSubscribed: boolean
  subscribedAt?: Date
}

export async function addSubscriber(userId: number, username: string | undefined) {
  await db.insert(subscribedUsers).values({
    userId,
    username,
  }).onConflictDoNothing()
}

export async function isUserSubscribed(userId: number): Promise<isUserSubscribedResponse> {
  const result = await db
    .select({ userId: subscribedUsers.userId, subscribedAt: sql<string>`${subscribedUsers.subscribedAt}` })
    .from(subscribedUsers)
    .where(eq(subscribedUsers.userId, userId))
    .limit(1)

  const isSubscribed = result.length > 0

  const response: isUserSubscribedResponse = { isSubscribed }
  if (isSubscribed)
    response.subscribedAt = new Date(result[0].subscribedAt)

  return response
}

export async function removeSubscriber(userId: number) {
  await db
    .delete(subscribedUsers)
    .where(eq(subscribedUsers.userId, userId))
}

const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🔔 Register', 'register')],
  [Markup.button.callback('🔕 Forget', 'forget')],
  [Markup.button.callback('❓ Check Status', 'status')],
])

const startMessage = `
Welcome to the Notification Bot!

Here are the available actions:
🔔 Register - Subscribe to notifications
🔕 Forget - Unsubscribe from notifications
❓ Check Status - View your current subscription

Please use the buttons below to interact with the bot.
`
function sendMainMenu(ctx: any) {
  ctx.reply('Choose an action:', mainKeyboard)
}

bot.command('start', (ctx) => {
  ctx.reply(startMessage, mainKeyboard)
})

bot.action('register', async (ctx) => {
  const userId = ctx.from.id
  const { isSubscribed } = await isUserSubscribed(userId)

  if (isSubscribed) {
    ctx.reply('You are already registered.')
  }
  else {
    await addSubscriber(userId, ctx.from.username)
    ctx.reply('You have been registered for notifications.')
    consola.info(`User subscribed ${userId}`)
  }

  ctx.answerCbQuery()
})

bot.action('forget', async (ctx) => {
  const userId = ctx.from.id
  const { isSubscribed } = await isUserSubscribed(userId)

  if (isSubscribed) {
    await removeSubscriber(userId)
    ctx.reply('You have been removed from the notification list.')
    consola.info(`User unsubscribed ${userId}`)
  }
  else {
    ctx.reply('You were not registered for notifications.')
  }

  ctx.answerCbQuery()
})

bot.action('status', async (ctx) => {
  const userId = ctx.from.id
  const { isSubscribed, subscribedAt } = await isUserSubscribed(userId)

  if (isSubscribed) {
    ctx.reply(`You are currently subscribed to notifications since ${subscribedAt!.toLocaleString()}.`)
  }
  else {
    ctx.reply('You are not currently subscribed to notifications.')
  }

  ctx.answerCbQuery()
})

bot.on(message('text'), (ctx) => {
  ctx.reply('Please use the buttons to interact with the bot:')
  sendMainMenu(ctx)
})

bot.launch()
consola.info('Telegram bot started')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
