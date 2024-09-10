/* eslint-disable no-console */
import { exit } from 'node:process'
import { Model } from 'objection'
import Knex from 'knex'
import { knexConfig } from './knexfile.js'

export const knexInstance = Knex(knexConfig)
Model.knex(knexInstance)

export class SalePointCredentials extends Model {
  id!: string
  company!: string
  storeId!: string
  storeFullName!: string
  deviceType!: string
  publicIp!: string
  username!: string
  password!: string
  email!: string

  static get tableName() {
    return 'sale_point_credentials'
  }

  static get idColumn() {
    return 'id'
  }
}

export async function runMigrations() {
  try {
    const [, runMigrations] = await knexInstance.migrate.latest()
    if (runMigrations.length === 0) {
      console.log('No migrations to run')
    }
    else {
      console.log(`Migrations executed ${runMigrations.length}`, runMigrations)
    }
  }
  catch (error) {
    console.error('Failed to run migrations:', error)
    exit(1)
  }
}
