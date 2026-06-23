import { useEffect, useMemo, useState } from "react";
import brandLogo from "./assets/navee/nk.png";
import trainerPhoto from "./assets/navee/nk.png";
import "./App.css";

const currentDay = new Date();

const makeDateKey = (offsetDays = 0) => {
  const nextDate = new Date(currentDay);
  nextDate.setDate(currentDay.getDate() + offsetDays);
  return nextDate.toLocaleDateString("en-CA");
};

const formatLongDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);


const formatShortDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatClock = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

const createHistory = (statuses) =>
  statuses.map((status, index) => ({
    date: makeDateKey(index - statuses.length + 1),
    status,
  }));

const cycleStatus = (status) => {
  if (status === "Present") return "Late";
  if (status === "Late") return "Absent";
  return "Present";
};

const initialStudents = [
  { id: 1, name: "Subhash", batch: "Batch A", status: "Present", date: makeDateKey(0), history: createHistory(["Absent", "Present", "Present", "Late", "Present"]) },
  { id: 2, name: "Naveen Kumar", batch: "Batch A", status: "Absent", date: makeDateKey(-1), history: createHistory(["Present", "Absent", "Present", "Present", "Absent"]) },
  { id: 3, name: "Ramesh", batch: "Batch B", status: "Late", date: makeDateKey(-3), history: createHistory(["Present", "Late", "Present", "Absent", "Present"]) },
  { id: 4, name: "Karthik", batch: "Batch B", status: "Present", date: makeDateKey(-2), history: createHistory(["Present", "Present", "Absent", "Present", "Present"]) },
  { id: 5, name: "Vishnu Murthy", batch: "Batch B", status: "Late", date: makeDateKey(0), history: createHistory(["Present", "Late", "Absent", "Late", "Present"]) },
  { id: 6, name: "Bharathi Kananan", batch: "Batch C", status: "Present", date: makeDateKey(-3), history: createHistory(["Absent", "Present", "Present", "Present", "Present"]) },
  { id: 7, name: "Vijay", batch: "Batch C", status: "Absent", date: makeDateKey(-1), history: createHistory(["Present", "Absent", "Present", "Absent", "Absent"]) },
  { id: 8, name: "Ragul", batch: "Batch D", status: "Present", date: makeDateKey(0), history: createHistory(["Present", "Present", "Late", "Present", "Present"]) },
  { id: 9, name: "Ravi", batch: "Batch D", status: "Late", date: makeDateKey(-2), history: createHistory(["Absent", "Late", "Present", "Present", "Late"]) },
  { id: 10, name: "Manoj", batch: "Batch E", status: "Present", date: makeDateKey(0), history: createHistory(["Present", "Present", "Present", "Present", "Present"]) },
  { id: 11, name: "Sanjay", batch: "Batch E", status: "Absent", date: makeDateKey(-3), history: createHistory(["Absent", "Present", "Absent", "Absent", "Absent"]) },

];

const initialMessages = [
  { id: 1, sender: "Trainer", text: "Mark attendance before the session starts." },
  { id: 2, sender: "Assistant", text: "Batch A and Batch B are updated." },
  { id: 3, sender: "System", text: "Weekly summary is ready for export." },
];

const weeklyTrend = [72, 78, 74, 81, 84, 88, 91];
const monthlyTrend = [64, 66, 70, 74, 77, 80, 83, 85, 87, 89, 92, 94];
const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getGreeting = (hour) => {
  if (hour < 12) return "Attendance";
  if (hour < 17) return "Attendance";
  return;
};

const downloadTextFile = (fileName, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

function App() {
  const [students, setStudents] = useState(initialStudents);
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudents[0].id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "All batch summaries are synced." },
    { id: 2, text: "Attendance streak updated for Manoj." },
  ]);
  const [newStudent, setNewStudent] = useState({ name: "", batch: "Batch F", status: "Present", date: makeDateKey(0) });

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const batches = useMemo(() => ["All", ...new Set(students.map((student) => student.batch))], [students]);

  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((student) => student.status === "Present").length;
    const absent = students.filter((student) => student.status === "Absent").length;
    const late = students.filter((student) => student.status === "Late").length;

    return { total, present, absent, late, attendancePercentage: total ? Math.round((present / total) * 100) : 0 };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch = !lowerSearch || student.name.toLowerCase().includes(lowerSearch) || student.batch.toLowerCase().includes(lowerSearch);
      const matchesBatch = batchFilter === "All" || student.batch === batchFilter;
      const matchesDate = !dateFilter || student.date === dateFilter;
      const matchesStatus = statusFilter === "All" || student.status === statusFilter;
      return matchesSearch && matchesBatch && matchesDate && matchesStatus;
    });
  }, [batchFilter, dateFilter, searchTerm, statusFilter, students]);

  const batchSummary = useMemo(() => {
    return batches.filter((batch) => batch !== "All").map((batch) => {
      const batchStudents = students.filter((student) => student.batch === batch);
      const batchPresent = batchStudents.filter((student) => student.status === "Present").length;
      const batchAbsent = batchStudents.filter((student) => student.status === "Absent").length;
      const batchLate = batchStudents.filter((student) => student.status === "Late").length;
      const percentage = batchStudents.length ? Math.round((batchPresent / batchStudents.length) * 100) : 0;
      return { batch, batchStudents, batchPresent, batchAbsent, batchLate, percentage };
    });
  }, [batches, students]);

  const pieData = useMemo(() => {
    const total = Math.max(stats.total, 1);
    const present = (stats.present / total) * 100;
    const absent = (stats.absent / total) * 100;
    const late = (stats.late / total) * 100;
    return {
      gradient: `conic-gradient(#69f0c1 0% ${present}%, #f7a14b ${present}% ${present + absent}%, #8ba6ff ${present + absent}% 100%)`,
      present,
      absent,
      late,
    };
  }, [stats.absent, stats.late, stats.present, stats.total]);

  const topStudent = useMemo(() => {
    return students.reduce((best, student) => {
      if (!best) return student;
      const bestScore = best.history.filter((entry) => entry.status === "Present").length;
      const studentScore = student.history.filter((entry) => entry.status === "Present").length;
      if (studentScore > bestScore) return student;
      if (studentScore === bestScore && student.name.localeCompare(best.name) < 0) return student;
      return best;
    }, null);
  }, [students]);

  const selectedStudent = useMemo(() => students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null, [selectedStudentId, students]);
  const notificationCount = notifications.length;
  const greeting = getGreeting(currentTime.getHours());
  const sessionDetails = { topic: "React + Data Analytics", batch: "Batch A to Batch F", room: "Training Room 4", duration: "10:00 AM - 1:00 PM" };

  const pushNotification = (text) => {
    setNotifications((current) => [{ id: Date.now(), text }, ...current].slice(0, 5));
  };

  const handleStatusChange = (id, status) => {
    setStudents((currentStudents) => currentStudents.map((student) => (student.id === id ? { ...student, status } : student)));
    pushNotification(`Updated attendance for student ${id}.`);
  };

  const handleCycleStatus = (id) => {
    setStudents((currentStudents) => currentStudents.map((student) => (student.id === id ? { ...student, status: cycleStatus(student.status) } : student)));
    pushNotification(`Attendance adjusted for ${id}.`);
  };

  const handleDeleteStudent = (id) => {
    const student = students.find((item) => item.id === id);
    if (!student) return;
    const confirmed = window.confirm(`Delete ${student.name} from the attendance list?`);
    if (!confirmed) return;
    setStudents((currentStudents) => currentStudents.filter((item) => item.id !== id));
    setSelectedStudentId((currentId) => (currentId === id ? students.find((item) => item.id !== id)?.id ?? null : currentId));
    pushNotification(`${student.name} removed from the record.`);
  };

  const handleMarkAll = (status) => {
    setStudents((currentStudents) => currentStudents.map((student) => ({ ...student, status })));
    pushNotification(`Marked every student as ${status.toLowerCase()}.`);
  };

  const handleAddStudent = () => {
    const trimmedName = newStudent.name.trim();
    if (!trimmedName) return;

    const studentToAdd = {
      id: Date.now(),
      name: trimmedName,
      batch: newStudent.batch.trim() || "Batch F",
      status: newStudent.status,
      date: newStudent.date || makeDateKey(0),
      history: createHistory([newStudent.status]),
    };

    setStudents((currentStudents) => [...currentStudents, studentToAdd]);
    setSelectedStudentId(studentToAdd.id);
    setNewStudent({ name: "", batch: studentToAdd.batch, status: "Present", date: makeDateKey(0) });
    pushNotification(`${studentToAdd.name} added to ${studentToAdd.batch}.`);
  };

  const handleSendMessage = () => {
    const nextMessage = chatInput.trim();
    if (!nextMessage) return;

    setChatMessages((currentMessages) => [{ id: Date.now(), sender: "You", text: nextMessage }, ...currentMessages]);
    setChatInput("");
  };

  const handleExportExcel = () => {
    const headers = ["Name", "Batch", "Date", "Status"];
    const rows = students.map((student) => [student.name, student.batch, student.date, student.status]);
    const csvContent = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadTextFile("attendance-report.csv", csvContent, "text/csv;charset=utf-8;");
    pushNotification("Attendance report exported as CSV.");
  };

  const handleExportPdf = () => {
    window.print();
    pushNotification("Print dialog opened for PDF export.");
  };

  const handlePrintReport = () => {
    window.print();
    pushNotification("Print dialog opened.");
  };

  return (
    <div className={`dashboard-shell theme-${theme}`}>
      <aside className={`sidebar ${menuOpen ? "is-open" : "is-collapsed"}`}>
        <div>
          <div className="brand-block">
            <div>
              <p className="eyebrow">NK Trainer</p>
              <h2>Attendance Dashboard</h2>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Dashboard sections">
            <a className="sidebar-link active" href="#overview">Overview</a>
            <a className="sidebar-link" href="#filters">Search & Filter</a>
            <a className="sidebar-link" href="#charts">Charts</a>
            <a className="sidebar-link" href="#table">Student Table</a>
            <a className="sidebar-link" href="#reports">Reports</a>
            <a className="sidebar-link" href="#chatbox">Chatbox</a>
          </nav>
        </div>

        <div className="sidebar-footer">
          <p>Live Clock</p>
          <strong>{formatClock(currentTime)}</strong>
          <span>{formatLongDate(currentTime)}</span>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="hero-panel glass-panel">
          <div className="hero-top-row">
            <button type="button" className="menu-toggle" onClick={() => setMenuOpen((current) => !current)} aria-pressed={menuOpen}>
              {menuOpen ? "Hide Menu" : "Show Menu"}
            </button>

            <div className="hero-actions">
              <button type="button" className="icon-button" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} aria-label="Toggle light mode">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <button type="button" className="icon-button bell-button" onClick={() => setNotificationsOpen((current) => !current)} aria-label="Toggle notifications">
                Notifications <span className="badge">{notificationCount}</span>
              </button>
            </div>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="profile-card">
                <img src={trainerPhoto} alt="Trainer avatar" className="profile-avatar" />
                <div>
                  <img className="brand-logo" src={brandLogo} alt="NK logo" />
                  <p className="eyebrow">Welcome to Trainer session Attendance Dashboard</p>
                  <p className="subtitle">{formatLongDate(currentTime)} · {formatClock(currentTime)}</p>
                  <h2>NK Trainer {greeting}, Dashboard</h2>
                </div>
              </div>

              <p className="lead-text">Track attendance, manage student records, and keep every batch visible from one polished workspace.</p>

              <div className="session-card">
                <div>
                  <p className="card-label">Today's Session Details</p>
                  <strong>{sessionDetails.topic}</strong>
                  <p>{sessionDetails.batch}</p>
                </div>
                <div>
                  <p>{sessionDetails.room}</p>
                  <strong>{sessionDetails.duration}</strong>
                </div>
              </div>

              <div className="hero-mini-grid">
                <article className="glass-tile">
                  <p className="card-label">Attendance Streak Counter</p>
                  <strong>12 days</strong>
                  <span>Highest consistency this month</span>
                </article>
                <article className="glass-tile">
                  <p className="card-label">Top Attendance Student Card</p>
                  <strong>🏆 {topStudent?.name ?? "N/A"}</strong>
                  <span>{topStudent?.batch ?? "-"} · {topStudent?.status ?? "-"}</span>
                </article>
                <article className="glass-tile">
                  <p className="card-label">Today's Session Summary</p>
                  <strong>{stats.present} Present</strong>
                  <span>{stats.absent} Absent · {stats.late} Late</span>
                </article>
              </div>
            </div>

            <div className="hero-side">
              <div className="hero-stats-grid">
                <article className="stat-card glass-tile"><p>Total Students</p><strong>{stats.total}</strong></article>
                <article className="stat-card glass-tile"><p>Present Students</p><strong>{stats.present}</strong></article>
                <article className="stat-card glass-tile"><p>Absent Students</p><strong>{stats.absent}</strong></article>
                <article className="stat-card glass-tile"><p>Late Students</p><strong>{stats.late}</strong></article>
                <article className="stat-card glass-tile accent-card"><p>Attendance Percentage</p><strong>{stats.attendancePercentage}%</strong></article>
                <article className="stat-card glass-tile"><p>Session Mode</p><strong>{theme === "dark" ? "Dark" : "Light"}</strong></article>
              </div>

              {notificationsOpen ? (
                <section className="notification-panel glass-tile">
                  <div className="panel-header compact">
                    <div>
                      <p className="eyebrow">Notification Bell</p>
                      <h3>Recent alerts</h3>
                    </div>
                    <span className="chip">Live</span>
                  </div>
                  <div className="notification-list">
                    {notifications.map((notification) => <p key={notification.id}>{notification.text}</p>)}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </header>

        <section className="controls-grid" id="filters">
          <article className="glass-panel control-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Search & Filter</p>
                <h3>Student lookup</h3>
              </div>
              <span className="chip">Search Student</span>
            </div>

            <div className="filter-grid">
              <label>
                <span>Search Student</span>
                <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name or batch" />
              </label>
              <label>
                <span>Filter by Batch</span>
                <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
                  {batches.map((batch) => <option key={batch} value={batch}>{batch}</option>)}
                </select>
              </label>
              <label>
                <span>Filter by Date</span>
                <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
              </label>
              <label>
                <span>Attendance Status Filter</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="All">All</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </label>
            </div>
          </article>

          <article className="glass-panel quick-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Quick Action Buttons</p>
                <h3>Fast attendance tools</h3>
              </div>
              <span className="chip">Premium</span>
            </div>

            <div className="quick-actions">
              <button type="button" onClick={() => handleMarkAll("Present")}>Mark All Present</button>
              <button type="button" onClick={() => handleMarkAll("Absent")}>Mark All Absent</button>
              <button type="button" onClick={() => setNewStudent((current) => ({ ...current, date: makeDateKey(0) }))}>Add Student</button>
            </div>

            <div className="new-student-form">
              <label>
                <span>Student Name</span>
                <input type="text" value={newStudent.name} onChange={(event) => setNewStudent((current) => ({ ...current, name: event.target.value }))} placeholder="Enter student name" />
              </label>
              <label>
                <span>Batch</span>
                <input type="text" value={newStudent.batch} onChange={(event) => setNewStudent((current) => ({ ...current, batch: event.target.value }))} placeholder="Batch F" />
              </label>
              <label>
                <span>Status</span>
                <select value={newStudent.status} onChange={(event) => setNewStudent((current) => ({ ...current, status: event.target.value }))}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </label>
              <label>
                <span>Date</span>
                <input type="date" value={newStudent.date} onChange={(event) => setNewStudent((current) => ({ ...current, date: event.target.value }))} />
              </label>
              <button type="button" className="primary-action" onClick={handleAddStudent}>Add Student</button>
            </div>
          </article>
        </section>

        <section className="analytics-grid" id="charts">
          <article className="glass-panel batch-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Batch Wise Attendance</p>
                <h3>Batch overview</h3>
              </div>
              <span className="chip">Charts</span>
            </div>

            <div className="batch-list">
              {batchSummary.map((item) => (
                <div className="batch-row" key={item.batch}>
                  <div className="batch-row-head"><strong>{item.batch}</strong><span>{item.percentage}%</span></div>
                  <div className="track"><div className="fill" style={{ width: `${item.percentage}%` }} /></div>
                  <p>{item.batchPresent} Present · {item.batchAbsent} Absent · {item.batchLate} Late</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel chart-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Attendance Trend Chart</p>
                <h3>Weekly and monthly view</h3>
              </div>
              <span className="chip">Live analytics</span>
            </div>

            <div className="chart-stack">
              <section className="chart-card">
                <div className="chart-card-head"><strong>Weekly attendance trend</strong><span>Weekly</span></div>
                <div className="bar-chart week-chart">
                  {weeklyTrend.map((value, index) => (
                    <div className="bar-column" key={index}>
                      <div className="bar" style={{ height: `${value}%` }} />
                      <span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="chart-card pie-card">
                <div className="chart-card-head"><strong>Present vs Absent Pie Chart</strong><span>Today</span></div>
                <div className="pie-wrap">
                  <div className="pie-chart" style={{ background: pieData.gradient }}>
                    <div className="pie-center"><strong>{stats.attendancePercentage}%</strong><span>Present</span></div>
                  </div>
                  <div className="legend-list">
                    <p><span className="legend-dot present" />Present {stats.present}</p>
                    <p><span className="legend-dot absent" />Absent {stats.absent}</p>
                    <p><span className="legend-dot late" />Late {stats.late}</p>
                  </div>
                </div>
              </section>

              <section className="chart-card">
                <div className="chart-card-head"><strong>Monthly Attendance Graph</strong><span>12 months</span></div>
                <div className="bar-chart month-chart">
                  {monthlyTrend.map((value, index) => (
                    <div className="bar-column month-column" key={index}>
                      <div className="bar monthly" style={{ height: `${value}%` }} />
                      <span>{monthlyLabels[index]}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        </section>

        <section className="glass-panel table-section" id="table">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Student Table</p>
              <h3>Attendance records</h3>
            </div>
            <div className="header-actions">
              <button type="button" className="icon-button" onClick={handleExportExcel}>Export Excel</button>
              <button type="button" className="icon-button" onClick={handleExportPdf}>Export PDF</button>
              <button type="button" className="icon-button" onClick={handlePrintReport}>Print Report</button>
            </div>
          </div>

          <div className="table-summary">
            <p>{filteredStudents.length} records visible from {students.length} students.</p>
            <p>Filters active: {batchFilter === "All" ? "All batches" : batchFilter} · {statusFilter === "All" ? " All statuses" : ` ${statusFilter}`} · {dateFilter ? ` ${formatShortDate(dateFilter)}` : " Any date"}</p>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Batch</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className={selectedStudent?.id === student.id ? "active-row" : ""}>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.batch}</td>
                    <td>{formatShortDate(student.date)}</td>
                    <td>
                      <select value={student.status} onChange={(event) => handleStatusChange(student.id, event.target.value)}>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => handleCycleStatus(student.id)}>Edit Attendance</button>
                        <button type="button" onClick={() => setSelectedStudentId(student.id)}>View History</button>
                        <button type="button" onClick={() => handleDeleteStudent(student.id)}>Delete Record</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bottom-grid">
          <article className="glass-panel report-panel" id="reports">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Reports</p>
                <h3>Export and review</h3>
              </div>
              <span className="chip">Reports</span>
            </div>

            <div className="report-grid">
              <button type="button" className="report-button" onClick={handleExportExcel}>Export Excel</button>
              <button type="button" className="report-button" onClick={handleExportPdf}>Export PDF</button>
              <button type="button" className="report-button" onClick={handlePrintReport}>Print Report</button>
            </div>

            <div className="student-history">
              <div className="panel-header compact">
                <div>
                  <p className="eyebrow">View History</p>
                  <h3>{selectedStudent?.name ?? "Student history"}</h3>
                </div>
                <span className="chip">Profile</span>
              </div>

              <div className="history-card">
                <img src={trainerPhoto} alt="Student avatar preview" className="history-avatar" />
                <div>
                  <p>{selectedStudent?.batch ?? "Select a student"}</p>
                  <strong>{selectedStudent?.status ?? "-"}</strong>
                  <p>Recent records:</p>
                  <div className="history-tags">
                    {(selectedStudent?.history ?? []).slice(-5).map((entry) => (
                      <span key={`${entry.date}-${entry.status}`} className={`history-tag ${entry.status.toLowerCase()}`}>
                        {entry.status} · {formatShortDate(entry.date)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="glass-panel chat-section" id="chatbox">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Reports</p>
                <h3>Quick messages</h3>
              </div>
              <span className="chip">Chat</span>
            </div>

            <div className="chat-window">
              {chatMessages.map((message) => (
                <div className="chat-message" key={message.id}>
                  <strong>{message.sender}</strong>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>

            <div className="chat-composer">
              <input type="text" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type a message" aria-label="Chat message" />
              <button type="button" onClick={handleSendMessage}>Send</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;