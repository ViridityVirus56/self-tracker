import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const schedules = await prisma.schedule.findMany({
    where: { userId: session.userId },
    include: { exercise: true },
  })

  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dayOfWeek, exerciseId } = await req.json()
  if (dayOfWeek === undefined || !exerciseId) {
    return NextResponse.json({ error: 'Missing dayOfWeek or exerciseId' }, { status: 400 })
  }

  const schedule = await prisma.schedule.create({
    data: {
      dayOfWeek,
      exerciseId,
      userId: session.userId,
    },
    include: { exercise: true },
  })

  return NextResponse.json(schedule)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing schedule ID' }, { status: 400 })

  const schedule = await prisma.schedule.findUnique({ where: { id } })
  if (!schedule || schedule.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.schedule.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
