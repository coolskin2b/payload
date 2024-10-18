import type { PgColumn } from 'drizzle-orm/pg-core'

import { sql } from 'drizzle-orm'

export const buildPointFieldQuery = ({
  column,
  operator,
  value,
}: {
  column: PgColumn
  operator: 'intersects' | 'near' | 'within'
  value: unknown
}) => {
  if (typeof value !== 'string') {
    return
  }

  const [lng, lat, maxDistance, minDistance] = value.split(',')

  if (operator === 'near') {
    return sql`
      ST_DWithin(${column}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), ${maxDistance})
      AND ST_Distance(${column}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) >= ${minDistance}
    `
  }

  if (operator === 'intersects') {
    return sql`
      ST_Intersects(${column}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))
    `
  }

  if (operator === 'within') {
    throw new Error('not implemented')
  }
}
