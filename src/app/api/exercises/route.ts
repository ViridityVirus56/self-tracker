import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
  })

  return NextResponse.json(exercises)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const exercise = await prisma.exercise.create({
    data: {
      name,
      userId: session.userId,
    },
  })

  return NextResponse.json(exercise)
}
