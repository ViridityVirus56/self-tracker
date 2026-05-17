"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Plus, Calendar as CalendarIcon, Settings, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Exercise = { id: string; name: string }
type Schedule = { id: string; dayOfWeek: number; exerciseId: string; exercise: Exercise }
type SetData = { id: string; reps: number; weight: number; date: string; exercise: Exercise }

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [sets, setSets] = useState<SetData[]>([])

  const [newExercise, setNewExercise] = useState("")
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)

  const [selectedDay, setSelectedDay] = useState<string>("0")
  const [selectedScheduleExercise, setSelectedScheduleExercise] = useState<string>("")
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const [setExerciseId, setSetExerciseId] = useState<string>("")
  const [setReps, setSetReps] = useState<string>("")
  const [setWeight, setSetWeight] = useState<string>("")
  const [isSetOpen, setIsSetOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [exRes, scRes, setRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/schedules"),
        fetch(`/api/sets?date=${new Date().toISOString()}`)
      ])
      
      if (exRes.ok) setExercises(await exRes.json())
      if (scRes.ok) setSchedules(await scRes.json())
      if (setRes.ok) setSets(await setRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handleAddExercise = async () => {
    if (!newExercise) return
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExercise }),
    })
    if (res.ok) {
      setNewExercise("")
      setIsExerciseOpen(false)
      fetchData()
    }
  }

  const handleAddSchedule = async () => {
    if (!selectedScheduleExercise) return
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: parseInt(selectedDay), exerciseId: selectedScheduleExercise }),
    })
    if (res.ok) {
      setIsScheduleOpen(false)
      fetchData()
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    const res = await fetch(`/api/schedules?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  const handleAddSet = async () => {
    if (!setExerciseId || !setReps || !setWeight) return
    const res = await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: setExerciseId,
        reps: parseInt(setReps),
        weight: parseFloat(setWeight)
      }),
    })
    if (res.ok) {
      setSetReps("")
      setSetWeight("")
      setIsSetOpen(false)
      fetchData()
    }
  }

  const today = new Date().getDay()
  const todaySchedules = schedules.filter(s => s.dayOfWeek === today)
  const scheduledExerciseIds = new Set(todaySchedules.map(s => s.exerciseId))
  
  const scheduledExercises = exercises.filter(e => scheduledExerciseIds.has(e.id))
  const otherExercises = exercises.filter(e => !scheduledExerciseIds.has(e.id))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 max-w-5xl mx-auto">
          <Link href="/" className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold">
            <Dumbbell className="h-5 w-5 text-primary" />
            Workout Tracker
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 mx-auto max-w-5xl space-y-8">
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
            <TabsTrigger value="log">Log</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Today's Workout</h2>
                <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
              </div>
              <Dialog open={isSetOpen} onOpenChange={setIsSetOpen}>
                <DialogTrigger render={<Button className="shadow-lg shadow-primary/20" />}>
                  <Plus className="mr-2 h-4 w-4" /> Add Set
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Set</DialogTitle>
                    <DialogDescription>Log a new set for today.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Exercise</Label>
                      <Select value={setExerciseId} onValueChange={(val) => val && setSetExerciseId(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {scheduledExercises.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Today's Schedule</div>
                              {scheduledExercises.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                              ))}
                            </>
                          )}
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">Other Exercises</div>
                          {otherExercises.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Weight (kg/lbs)</Label>
                        <Input type="number" value={setWeight} onChange={e => setSetWeight(e.target.value)} placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Reps</Label>
                        <Input type="number" value={setReps} onChange={e => setSetReps(e.target.value)} placeholder="0" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSet}>Save Set</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-white/5 bg-secondary/10">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Exercise</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No sets logged today. Start lifting!
                        </TableCell>
                      </TableRow>
                    ) : (
                      sets.map(set => (
                        <TableRow key={set.id} className="hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium">{set.exercise.name}</TableCell>
                          <TableCell>{set.weight}</TableCell>
                          <TableCell>{set.reps}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {format(new Date(set.date), 'h:mm a')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
                <p className="text-muted-foreground">Plan your routine for the week.</p>
              </div>
              <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogTrigger render={<Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" />}>
                  <CalendarIcon className="mr-2 h-4 w-4" /> Add to Schedule
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add to Schedule</DialogTitle>
                    <DialogDescription>Assign an exercise to a specific day.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select value={selectedDay} onValueChange={(val) => val && setSelectedDay(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Exercise</Label>
                      <Select value={selectedScheduleExercise} onValueChange={(val) => val && setSelectedScheduleExercise(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSchedule}>Save to Schedule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DAYS.map((day, idx) => {
                const daySchedules = schedules.filter(s => s.dayOfWeek === idx)
                return (
                  <Card key={idx} className={`border-white/5 ${idx === today ? 'bg-primary/5 border-primary/20' : 'bg-secondary/10'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex justify-between items-center">
                        {day}
                        {idx === today && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Today</span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {daySchedules.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Rest day</p>
                      ) : (
                        <ul className="space-y-2">
                          {daySchedules.map(s => (
                            <li key={s.id} className="flex justify-between items-center text-sm bg-black/20 px-3 py-2 rounded-md">
                              <span>{s.exercise.name}</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSchedule(s.id)}>
                                &times;
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Exercises</h2>
                <p className="text-muted-foreground">Manage your exercise library.</p>
              </div>
              <Dialog open={isExerciseOpen} onOpenChange={setIsExerciseOpen}>
                <DialogTrigger render={<Button variant="outline" />}>
                  <Plus className="mr-2 h-4 w-4" /> New Exercise
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Exercise</DialogTitle>
                    <DialogDescription>Add a new exercise to your library.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={newExercise} onChange={e => setNewExercise(e.target.value)} placeholder="Bench Press" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddExercise}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-white/5 bg-secondary/10">
              <ScrollArea className="h-[400px]">
                <div className="p-4 flex flex-col gap-2">
                  {exercises.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No exercises yet. Create one to get started.</p>
                  ) : (
                    exercises.map(ex => (
                      <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
                        <span className="font-medium">{ex.name}</span>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
