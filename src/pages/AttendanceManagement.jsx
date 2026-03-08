import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Upload, Calendar, Check, X, FileSpreadsheet, Users, Download, Plus, FolderOpen, Trash2 } from 'lucide-react'
import { studentsService, attendanceService, lecturesService, classesService } from '../supabase/dataService'

const AttendanceManagement = () => {
  const classThemes = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-orange-500',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600'
  ]

  const [classes, setClasses] = useState([])
  const [classStudentCounts, setClassStudentCounts] = useState({})
  const [selectedClassId, setSelectedClassId] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [showClassForm, setShowClassForm] = useState(false)
  const [students, setStudents] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [lectures, setLectures] = useState([])
  const [selectedLectureId, setSelectedLectureId] = useState('')
  const [lectureForm, setLectureForm] = useState({
    startTime: '',
    endTime: '',
    title: ''
  })
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      loadStudents()
      loadLecturesForDate(selectedDate)
    } else {
      setStudents([])
      setLectures([])
      setSelectedLectureId('')
    }
  }, [selectedClassId])

  useEffect(() => {
    if (selectedClassId) {
      loadLecturesForDate(selectedDate)
    }
  }, [selectedDate, selectedClassId])

  useEffect(() => {
    if (selectedLectureId) {
      loadAttendance(selectedLectureId)
    } else {
      setAttendance({})
    }
  }, [selectedLectureId])

  const loadClasses = async () => {
    try {
      const classesData = await classesService.getAll()
      const allStudents = await studentsService.getAll()
      const counts = allStudents.reduce((acc, student) => {
        const key = student.classId
        if (!key) return acc
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      setClassStudentCounts(counts)
      setClasses(classesData)
      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id)
      }
    } catch (error) {
      console.error('Error loading classes:', error)
      setMessage('Error loading classes: ' + error.message)
    }
  }

  const createClass = async () => {
    if (!newClassName.trim()) {
      setMessage('Please enter a class name')
      return
    }

    setLoading(true)
    try {
      const created = await classesService.create(newClassName.trim())
      setMessage(`Class "${newClassName}" created successfully!`)
      setNewClassName('')
      setShowClassForm(false)
      await loadClasses()
      setSelectedClassId(created.id)
    } catch (error) {
      setMessage('Error creating class: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteClass = async (classId) => {
    const className = classes.find((item) => item.id === classId)?.name || 'this class'
    if (!confirm(`Delete ${className}? This will remove its students, lectures, and attendance records.`)) return

    try {
      await classesService.removeById(classId)
      setMessage('Class deleted successfully.')
      const remaining = classes.filter((item) => item.id !== classId)
      if (selectedClassId === classId) {
        setSelectedClassId(remaining[0]?.id || '')
      }
      await loadClasses()
    } catch (error) {
      setMessage('Error deleting class: ' + error.message)
    }
  }

  const loadStudents = async () => {
    if (!selectedClassId) return
    
    try {
      const studentsData = await studentsService.getByClass(selectedClassId)
      setStudents(studentsData)
      setMessage('')
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
      setMessage('Error loading students: ' + error.message)
    }
  }

  const loadLecturesForDate = async (date) => {
    if (!selectedClassId) return

    try {
      const lectureRows = await lecturesService.getByDateAndClass(date, selectedClassId)
      setLectures(lectureRows)

      if (lectureRows.length === 0) {
        setSelectedLectureId('')
        setAttendance({})
      } else {
        setSelectedLectureId((prev) =>
          lectureRows.some((lecture) => lecture.id === prev) ? prev : lectureRows[0].id
        )
      }
    } catch (error) {
      console.error('Error loading lectures:', error)
      setLectures([])
      setSelectedLectureId('')
      setAttendance({})
      setMessage('Error loading lecture timings: ' + error.message)
    }
  }

  const loadAttendance = async (lectureId) => {
    try {
      const records = await attendanceService.getByLecture(lectureId)
      const attendanceData = {}

      records.forEach((record) => {
        attendanceData[record.student_id] = {
          id: record.id,
          status: record.status
        }
      })

      setAttendance(attendanceData)
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance({})
      setMessage('Error loading attendance: ' + error.message)
    }
  }

  const createLectureSession = async () => {
    if (!selectedClassId) {
      setMessage('Please select a class first.')
      return
    }

    if (!lectureForm.startTime || !lectureForm.endTime) {
      setMessage('Please set both lecture start and end time.')
      return
    }

    if (lectureForm.endTime <= lectureForm.startTime) {
      setMessage('Lecture end time must be after start time.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const created = await lecturesService.create({
        lectureDate: selectedDate,
        startTime: lectureForm.startTime,
        endTime: lectureForm.endTime,
        title: lectureForm.title.trim(),
        classId: selectedClassId
      })

      setLectureForm({ startTime: '', endTime: '', title: '' })
      await loadLecturesForDate(selectedDate)
      setSelectedLectureId(created.id)
      setMessage('Lecture timing created. You can now mark attendance lecture-wise.')
    } catch (error) {
      console.error('Error creating lecture:', error)
      setMessage('Error creating lecture timing: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!selectedClassId) {
      setMessage('Please select a class before uploading students.')
      e.target.value = ''
      return
    }

    if (students.length > 0) {
      setMessage('Excel upload is locked for this class to prevent duplicates. Create a new class for another roster.')
      e.target.value = ''
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)

          const studentsToInsert = jsonData
            .map((row) => ({
              name: row.Name || row.name || row.StudentName || row['Student Name'],
              rollNo: row.RollNo || row['Roll No'] || row.Roll || row.roll_no || ''
            }))
            .filter((row) => row.name)

          await studentsService.addMany(studentsToInsert, selectedClassId)
          setMessage(`Successfully uploaded ${studentsToInsert.length} students!`)
          await loadStudents()
        } catch (error) {
          setMessage('Error parsing Excel file: ' + error.message)
        } finally {
          setLoading(false)
          e.target.value = ''
        }
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      setLoading(false)
      setMessage('Error uploading file: ' + error.message)
    }
  }

  const selectedClass = classes.find((cls) => cls.id === selectedClassId)
  const selectedClassCount = classStudentCounts[selectedClassId] || 0
  const uploadLocked = selectedClassId && selectedClassCount > 0

  const toggleAttendance = async (studentId, currentStatus) => {
    if (!selectedLectureId) {
      setMessage('Create or select a lecture timing before marking attendance.')
      return
    }

    const newStatus = currentStatus === 'present' ? 'absent' : 'present'

    try {
      const saved = await attendanceService.saveStatus({
        studentId,
        date: selectedDate,
        lectureId: selectedLectureId,
        status: newStatus
      })

      setAttendance((prev) => ({
        ...prev,
        [studentId]: { id: saved.id, status: newStatus }
      }))
    } catch (error) {
      setMessage('Error updating attendance: ' + error.message)
    }
  }

  const deleteLecture = async (lectureId, e) => {
    e.stopPropagation()
    if (!confirm('Delete this lecture? All attendance records for this lecture will also be deleted.')) return

    try {
      await lecturesService.removeById(lectureId)
      setMessage('Lecture deleted successfully')
      if (selectedLectureId === lectureId) {
        setSelectedLectureId('')
      }
      await loadLecturesForDate(selectedDate)
    } catch (error) {
      setMessage('Error deleting lecture: ' + error.message)
    }
  }

  const exportSignatureSheet = async () => {
    if (!selectedClassId) {
      setMessage('Please select a class first.')
      return
    }

    if (students.length === 0) {
      setMessage('Please upload students before exporting signature sheet.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const allLectures = await lecturesService.getByClass(selectedClassId)

      if (allLectures.length === 0) {
        setMessage('No lecture timings found for this class.')
        return
      }

      const allAttendance = await attendanceService.getAll()

      if (allAttendance.length === 0) {
        setMessage('No attendance records found. Mark attendance first, then export.')
        return
      }

      const lectureById = new Map(allLectures.map((lecture) => [lecture.id, lecture]))

      const activeLectureIds = [...new Set(
        allAttendance
          .filter((record) => record.status === 'present' && record.lecture_id)
          .map((record) => record.lecture_id)
      )]

      const activeLectures = activeLectureIds
        .map((lectureId) => lectureById.get(lectureId))
        .filter(Boolean)
        .sort((a, b) => {
          if (a.lecture_date !== b.lecture_date) {
            return a.lecture_date.localeCompare(b.lecture_date)
          }
          return a.start_time.localeCompare(b.start_time)
        })

      if (activeLectures.length === 0) {
        setMessage('No lecture-wise present attendance found for export.')
        return
      }

      const statusLookup = new Map(
        allAttendance
          .filter((record) => record.lecture_id)
          .map((record) => [`${record.student_id}__${record.lecture_id}`, record.status])
      )

      const headerLabels = activeLectures.map((lecture) => {
        const parsed = new Date(`${lecture.lecture_date}T00:00:00`)
        const date = parsed.getDate()
        const month = parsed.toLocaleDateString('en-US', { month: 'short' })
        const timeRange = `${lecture.start_time.slice(0, 5)}-${lecture.end_time.slice(0, 5)}`
        return `${date}\n${month}\n${timeRange}`
      })

      const rows = students.map((student) => {
        const row = {
          'Roll No': student.rollNo || '-',
          'Student Name': student.name
        }

        activeLectures.forEach((lecture, index) => {
          const status = statusLookup.get(`${student.id}__${lecture.id}`)
          row[headerLabels[index]] = status === 'present' ? '' : 'Absent'
        })

        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(rows)
      worksheet['!cols'] = [
        { wch: 14 },
        { wch: 28 },
        ...activeLectures.map(() => ({ wch: 12 }))
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Signature Register')

      const firstDate = activeLectures[0].lecture_date
      const lastDate = activeLectures[activeLectures.length - 1].lecture_date
      const fileName =
        firstDate === lastDate
          ? `signature_register_${firstDate}.xlsx`
          : `signature_register_${firstDate}_to_${lastDate}.xlsx`

      XLSX.writeFile(workbook, fileName)
      setMessage(`Signature sheet exported with ${activeLectures.length} lecture session(s).`)
    } catch (error) {
      console.error('Error exporting signature sheet:', error)
      setMessage('Error exporting signature sheet: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="mt-2 text-gray-600">Select a class to manage attendance</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Manage Classes */}
      <div className="card mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Manage Classes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {classes.map((cls, index) => {
            const isSelected = selectedClassId === cls.id
            const total = classStudentCounts[cls.id] || 0

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`text-left rounded-xl border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-200 shadow-lg'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`h-16 bg-gradient-to-r ${classThemes[index % classThemes.length]} px-4 py-3 text-white`}>
                  <p className="text-xs opacity-90">Classroom</p>
                  <p className="text-base font-semibold truncate">{cls.name}</p>
                </div>
                <div className="px-4 py-3 bg-white">
                  <p className="text-sm text-gray-600">Students: <span className="font-semibold text-gray-900">{total}</span></p>
                  <p className="text-xs text-gray-500 mt-1">{total > 0 ? 'Roster uploaded' : 'Ready for roster upload'}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          {!showClassForm && (
            <button
              onClick={() => setShowClassForm(true)}
              className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Class
            </button>
          )}

          {selectedClassId && (
            <button
              type="button"
              onClick={() => deleteClass(selectedClassId)}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected Class
            </button>
          )}
        </div>

        {showClassForm && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Class Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Class 10A, CS-101"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                onClick={createClass}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowClassForm(false)
                  setNewClassName('')
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {classes.length === 0 && !showClassForm && (
          <p className="text-sm text-gray-500">
            No classes found. Create your first class to get started.
          </p>
        )}
      </div>

      {!selectedClassId && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">
            Please select or create a class to manage students and attendance.
          </p>
        </div>
      )}

      {selectedClassId && (
        <>
          <div className="card mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Upload Student Roster
            </h2>
            {selectedClass && (
              <p className="text-sm text-gray-500 mb-2">Selected class: <span className="font-medium text-gray-700">{selectedClass.name}</span></p>
            )}
            <p className="text-gray-600 mb-4">
              Upload an Excel file (.xlsx or .csv) with columns: Name, Roll No (optional)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto ${
                uploadLocked || loading
                  ? 'px-3 sm:px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm sm:text-base cursor-not-allowed'
                  : 'btn-primary cursor-pointer'
              }`}>
                <Upload className="w-4 h-4" />
                {uploadLocked ? 'Roster Already Uploaded' : loading ? 'Uploading...' : 'Choose Excel File'}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={loading || uploadLocked}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportSignatureSheet}
                disabled={loading}
                className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download Signature Excel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Present = blank space for student signature, Absent = marked as "Absent".
          Only attendance dates with present students are included.
        </p>
        {uploadLocked && (
          <p className="text-xs text-amber-700 mt-2">
            Upload is disabled to prevent duplicate students in this class. Create a new class for another Excel roster.
          </p>
        )}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Mark Attendance (Lecture-wise)
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-full sm:w-auto sm:max-w-xs"
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Set Lecture Timing</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={lectureForm.title}
              onChange={(e) => setLectureForm((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Lecture title (optional)"
            />
            <input
              type="time"
              value={lectureForm.startTime}
              onChange={(e) => setLectureForm((prev) => ({ ...prev, startTime: e.target.value }))}
              className="input-field"
            />
            <input
              type="time"
              value={lectureForm.endTime}
              onChange={(e) => setLectureForm((prev) => ({ ...prev, endTime: e.target.value }))}
              className="input-field"
            />
            <button
              type="button"
              onClick={createLectureSession}
              disabled={loading}
              className="btn-primary w-full md:h-full"
            >
              Add Lecture
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Lecture Sessions for {selectedDate}</p>
            {lectures.length === 0 ? (
              <p className="text-xs text-gray-500">No lecture timings set for this date.</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
                {lectures.map((lecture) => {
                  const label = lecture.title
                    ? `${lecture.title} (${lecture.start_time.slice(0, 5)}-${lecture.end_time.slice(0, 5)})`
                    : `${lecture.start_time.slice(0, 5)}-${lecture.end_time.slice(0, 5)}`

                  return (
                    <div key={lecture.id} className="relative inline-flex shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedLectureId(lecture.id)}
                        className={`max-w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border text-left break-words ${
                          selectedLectureId === lecture.id
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => deleteLecture(lecture.id, e)}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-100 ${
                          selectedLectureId === lecture.id ? 'text-white hover:text-red-600' : 'text-gray-400 hover:text-red-600'
                        }`}
                        aria-label="Delete lecture"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {!selectedLectureId && students.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
            Create or select a lecture timing for this date to start marking attendance.
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No students found. Please upload a student roster first.</p>
          </div>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {students.map((student) => {
                const status = attendance[student.id]?.status || 'absent'

                return (
                  <div key={student.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-900 break-words">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll: {student.rollNo || '-'}</p>
                    </div>
                    <button
                      onClick={() => toggleAttendance(student.id, status)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                        status === 'present'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {status === 'present' ? (
                        <>
                          <Check className="w-4 h-4" />
                          Present
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Absent
                        </>
                      )}
                    </button>
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
                {students.map((student) => {
                  const status = attendance[student.id]?.status || 'absent'

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {student.rollNo || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleAttendance(student.id, status)}
                          className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                            status === 'present'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {status === 'present' ? (
                            <>
                              <Check className="w-4 h-4" />
                              Present
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Absent
                            </>
                          )}
                        </button>
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

export default AttendanceManagement
