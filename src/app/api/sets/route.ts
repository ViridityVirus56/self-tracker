import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')

  let whereClause: any = { userId: session.userId }
  
  if (dateStr) {
    const startOfDay = new Date(dateStr)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(dateStr)
    endOfDay.setHours(23, 59, 59, 999)
    
    whereClause.date = {
      gte: startOfDay,
      lte: endOfDay,
    }
  }

  const sets = await prisma.set.findMany({
    where: whereClause,
    include: { exercise: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(sets)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reps, weight, exerciseId, date } = await req.json()
  
  if (reps === undefined || weight === undefined || !exerciseId) {
    return NextResponse.json({ error: 'Missing reps, weight or exerciseId' }, { status: 400 })
  }

  const setDate = date ? new Date(date) : new Date()

  const set = await prisma.set.create({
    data: {
      reps,
      weight,
      exerciseId,
      date: setDate,
      userId: session.userId,
    },
    include: { exercise: true },
  })

  return NextResponse.json(set)
}
