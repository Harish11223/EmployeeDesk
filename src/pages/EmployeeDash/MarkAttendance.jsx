import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutProvider } from '../../components/LayoutContext';
import EmployeeNavbar from '../../components/EmployeeNavbar';
import EmployeeSideNav from '../../components/EmployeeSideNav';
import { firestore, auth } from '../../firebase-config';
import { doc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import {
    Box,
    Typography,
    Card,
    Select,
    MenuItem,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const drawerWidth = 240;

function MarkAttendance() {
    const [employeeId, setEmployeeId] = useState('');
    const [status, setStatus] = useState('present');
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const navigate = useNavigate();

    const getBreadcrumb = () => {
        const pathParts = location.pathname.split('/employeedash').filter(Boolean);
        const capitalized = pathParts.map((p) =>
            p === 'newuser' ? 'Add New Employee' : p.charAt(0).toUpperCase() + p.slice(1)
        );
        return (
            <>
                <Link to="/employeedash" style={{ color: '#333', textDecoration: 'none' }}>
                    Home
                </Link>
                {' > '}{capitalized.join(' > ')}
            </>
        );
    };

    useEffect(() => {
        if (auth.currentUser) {
            setEmployeeId(auth.currentUser.uid);
            fetchAttendanceHistory(auth.currentUser.uid);
        }
    }, []);

    const fetchAttendanceHistory = async (empId) => {
        setHistoryLoading(true);
        try {
            const employeeRef = doc(firestore, 'Employees', empId);
            const attendanceCol = collection(employeeRef, 'Attendance');
            const q = query(attendanceCol, orderBy('date', 'desc'));

            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAttendanceHistory(history);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
            toast.error("Failed to load attendance history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const markAttendance = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const formattedDate = now.toISOString().split('T')[0];
            const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const employeeRef = doc(firestore, 'Employees', employeeId);
            const attendanceCol = collection(employeeRef, 'Attendance');

            // Check if attendance already marked for today
            const q = query(attendanceCol, where('date', '==', formattedDate));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast.error('Attendance already marked for today');
                return;
            }

            await addDoc(attendanceCol, {
                status,
                date: formattedDate,
                time: formattedTime,
                timestamp: now
            });

            toast.success('Attendance marked successfully!');
            fetchAttendanceHistory(employeeId); // Refresh history after submission
        } catch (err) {
            toast.error('Error marking attendance: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutProvider>
            <EmployeeNavbar />
            <Box height={70} />
            <Box sx={{ display: 'flex' }}>
                <EmployeeSideNav />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 5,
                        transition: (theme) =>
                            theme.transitions.create('margin', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                        '&.expanded': {
                            marginLeft: { sm: `${drawerWidth}px` },
                            transition: (theme) =>
                                theme.transitions.create('margin', {
                                    easing: theme.transitions.easing.easeOut,
                                    duration: theme.transitions.duration.enteringScreen,
                                }),
                        },
                    }}
                >
                    <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: 'gray', fontSize: '0.9rem' }}
                        >
                            {getBreadcrumb()}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ color: '#1E1E1E', mb: 3 }}
                        >
                            Mark Attendance
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Attendance Form Card */}
                            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}
                                >
                                    Attendance Form
                                </Typography>

                                <Box sx={{ display: 'flex',gap: 2, mb: 3 }}>
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Select Date"
                                                value={date}
                                                onChange={(newValue) => setDate(newValue)}
                                                renderInput={(params) => (
                                                    <TextField {...params} fullWidth />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </div>

                                    <div style={{ flex: 2.5 }}>
                                        <Select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            fullWidth
                                            sx={{ minWidth: 150 }}
                                        >
                                            <MenuItem value="present">Present</MenuItem>
                                            <MenuItem value="absent">Absent</MenuItem>
                                            <MenuItem value="late">Late</MenuItem>
                                            <MenuItem value="half-day">Half Day</MenuItem>
                                        </Select>
                                    </div>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={markAttendance}
                                    disabled={loading}
                                    fullWidth
                                    size="large"
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Submit Attendance'}
                                </Button>
                            </Paper>

                            {/* Attendance History Section */}
                            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}
                                >
                                    Your Attendance History
                                </Typography>

                                {historyLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : attendanceHistory.length > 0 ? (
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: 'center' }}>Date</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>Status</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>Time</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {attendanceHistory.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell sx={{ textAlign: 'center' }}>{record.date}</TableCell>
                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    color: record.status === 'present' ? 'green' :
                                                                        record.status === 'absent' ? 'red' : 'orange',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {record.status.toUpperCase()}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                            {record.time ||
                                                                (record.timestamp?.toDate
                                                                    ? record.timestamp.toDate().toLocaleTimeString()
                                                                    : 'N/A')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                                        No attendance records found.
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default MarkAttendance;