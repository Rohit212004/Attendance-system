import { useState, useEffect } from 'react'
import { Calendar, Users, TrendingUp, FolderOpen } from 'lucide-react'
import { studentsService, attendanceService, lecturesService, classesService } from '../supabase/dataService'

const PublicAttendance = () => {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [lectureSessions, setLectureSessions] = useState([])
  const [selectedLectureId, setSelectedLectureId] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      initializePage()
    } else {
      setStudents([])
      setLectureSessions([])
      setSelectedLectureId('')
      setAttendanceRecords({})
      setStats({ total: 0, present: 0, absent: 0 })
    }
  }, [selectedClassId])

  useEffect(() => {
    if (selectedLectureId) {
      loadAttendanceForLecture(selectedLectureId)
    }
  }, [selectedLectureId, students])

  const loadClasses = async () => {
    try {
      const classesData = await classesService.getAll()
      setClasses(classesData)
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading classes:', error)
      setError('Error loading classes: ' + error.message)
      setLoading(false)
    }
  }

  const initializePage = async () => {
    if (!selectedClassId) return

    setRefreshing(true)
    setError('')

    try {
      const studentsData = await studentsService.getByClass(selectedClassId)
      setStudents(studentsData)

      const sessions = await lecturesService.getByClass(selectedClassId)
      const sortedSessions = [...sessions].sort((a, b) => {
        if (a.lecture_date !== b.lecture_date) {
          return a.lecture_date < b.lecture_date ? 1 : -1
        }
        return a.start_time < b.start_time ? 1 : -1
      })

      setLectureSessions(sortedSessions)

      if (sortedSessions.length === 0) {
        setAttendanceRecords({})
        setStats({ total: studentsData.length, present: 0, absent: 0 })
        setError('No attendance lecture has been created by teacher yet.')
      } else {
        setSelectedLectureId(sortedSessions[0].id)
      }
    } catch (loadError) {
      console.error('Error loading data:', loadError)
      setStudents([])
      setAttendanceRecords({})
      setStats({ total: 0, present: 0, absent: 0 })
      setError('Supabase not configured or tables are missing. Please check setup and add your anon key in .env.')
    } finally {
      setRefreshing(false)
    }
  }

  const loadAttendanceForLecture = async (lectureId) => {
    try {
      const attendanceRows = await attendanceService.getByLecture(lectureId)
      const attendanceData = {}

      attendanceRows.forEach((record) => {
        attendanceData[record.student_id] = record.status
      })

      setAttendanceRecords(attendanceData)

      const present = Object.values(attendanceData).filter((status) => status === 'present').length
      const absent = Math.max(students.length - present, 0)

      setStats({
        total: students.length,
        present,
        absent
      })
      setError('')
    } catch (error) {
      console.error('Error loading attendance for lecture:', error)
      setAttendanceRecords({})
      setStats({ total: students.length, present: 0, absent: 0 })
      setError('Error loading attendance for selected lecture.')
    }
  }

  const markedStudents = students.filter((student) => attendanceRecords[student.id])
  const hasLectureSessions = lectureSessions.length > 0

  const formatLectureOptionLabel = (lecture) => {
    const dateLabel = new Date(`${lecture.lecture_date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
    const timeLabel = `${lecture.start_time.slice(0, 5)}-${lecture.end_time.slice(0, 5)}`
    return lecture.title ? `${dateLabel} | ${timeLabel} | ${lecture.title}` : `${dateLabel} | ${timeLabel}`
  }

  const selectedLecture = lectureSessions.find((lecture) => lecture.id === selectedLectureId)
  const selectedLectureLabel = selectedLecture
    ? `${new Date(`${selectedLecture.lecture_date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} | ${selectedLecture.start_time.slice(0, 5)}-${selectedLecture.end_time.slice(0, 5)}`
    : 'Selected lecture session'

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Attendance</h1>
        <p className="mt-2 text-gray-600">View lecture-wise attendance records</p>
      </div>

      {/* Class Selector */}
      <div className="card mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Select Class
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedClassId === cls.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>

        {classes.length === 0 && (
          <p className="text-sm text-gray-500">
            No classes found. Please contact your teacher.
          </p>
        )}
      </div>

      {!selectedClassId && classes.length > 0 && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">
            Please select a class to view attendance records.
          </p>
        </div>
      )}

      {selectedClassId && (
        <>
          {refreshing && (
            <div className="mb-4 text-sm text-gray-500">Loading class data...</div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Present</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{stats.present}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Absent</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1">{stats.absent}</p>
            </div>
            <Users className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Lecture Session:</label>
          <select
            value={selectedLectureId}
            onChange={(e) => setSelectedLectureId(e.target.value)}
            className="input-field w-full sm:w-auto sm:min-w-[320px]"
            disabled={!hasLectureSessions}
          >
            {!hasLectureSessions && <option value="">No lecture sessions available</option>}
            {hasLectureSessions && selectedLectureId === '' && <option value="">Select a lecture session</option>}
            {lectureSessions.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>
                {formatLectureOptionLabel(lecture)}
              </option>
            ))}
          </select>
        </div>
        {hasLectureSessions && selectedLectureId && (
          <p className="mt-3 text-xs text-gray-500">Showing attendance for the selected lecture session.</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-4 leading-snug break-words">
          Attendance for {selectedLectureLabel}
        </h2>

        {markedStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No attendance has been marked for this lecture.</p>
          </div>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {markedStudents.map((student) => {
                const status = attendanceRecords[student.id]

                return (
                  <div key={student.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 break-words">{student.name}</p>
                        <p className="text-xs text-gray-500">Roll: {student.rollNo || '-'}</p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {markedStudents.map((student) => {
                    const status = attendanceRecords[student.id]

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {student.rollNo || '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default PublicAttendance
