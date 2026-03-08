import { supabase } from './client'

export const classesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(name) {
    const { data, error } = await supabase
      .from('classes')
      .insert({ name })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeById(id) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const studentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      rollNo: item.roll_no || '',
      classId: item.class_id,
      createdAt: item.created_at
    }))
  },

  async getByClass(classId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      rollNo: item.roll_no || '',
      classId: item.class_id,
      createdAt: item.created_at
    }))
  },

  async addMany(students, classId) {
    if (!students.length) return []

    const payload = students.map((student) => ({
      name: student.name,
      roll_no: student.rollNo || '',
      class_id: classId
    }))

    const { data, error } = await supabase.from('students').insert(payload).select()
    if (error) throw error
    return data || []
  },

  async removeById(id) {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
  }
}

export const attendanceService = {
  async getByDate(date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)

    if (error) throw error

    return data || []
  },

  async getAll() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error

    return data || []
  },

  async getByLecture(lectureId) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('lecture_id', lectureId)

    if (error) throw error

    return data || []
  },

  async saveStatus({ studentId, date, lectureId, status }) {
    if (!lectureId) {
      throw new Error('Lecture session is required before marking attendance.')
    }

    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('lecture_id', lectureId)
      .limit(1)

    if (existingError) throw existingError

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, marked_at: new Date().toISOString() })
        .eq('id', existing[0].id)
        .select()
        .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        lecture_id: lectureId,
        date,
        status,
        marked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const lecturesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .order('lecture_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByClass(classId) {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('class_id', classId)
      .order('lecture_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByDate(date) {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('lecture_date', date)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getByDateAndClass(date, classId) {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('lecture_date', date)
      .eq('class_id', classId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create({ lectureDate, startTime, endTime, title, classId }) {
    const { data, error } = await supabase
      .from('lectures')
      .insert({
        lecture_date: lectureDate,
        start_time: startTime,
        end_time: endTime,
        title: title || null,
        class_id: classId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeById(id) {
    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const tasksService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      dueDate: item.due_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description || '',
        due_date: task.dueDate,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description || '',
        due_date: updates.dueDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeById(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  }
}
