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

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing exercise ID' }, { status: 400 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise || exercise.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.exercise.update({
    where: { id },
    data: { name },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing exercise ID' }, { status: 400 })

  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise || exercise.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Delete associated schedules and sets first
  await prisma.schedule.deleteMany({ where: { exerciseId: id } })
  await prisma.set.deleteMany({ where: { exerciseId: id } })
  
  await prisma.exercise.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
