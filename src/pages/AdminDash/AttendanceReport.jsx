import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { toast } from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Collapse,
    IconButton,
    CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const drawerWidth = 240;

function AttendanceReport() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [employees, setEmployees] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [employeeDetails, setEmployeeDetails] = useState({});

    const getBreadcrumb = () => {
        const pathParts = location.pathname.split('/admindash').filter(Boolean);
        const capitalized = pathParts.map((p) =>
            p === 'newuser' ? 'Add New Employee' : p.charAt(0).toUpperCase() + p.slice(1)
        );
        return (
            <>
                <Link to="/admindash" style={{ color: '#333', textDecoration: 'none' }}>
                    Home
                </Link>
                {' > '}{capitalized.join(' > ')}
            </>
        );
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'Employees'));
                const employeesList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const employeeName = `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim();

                    // Store employee details for quick access
                    setEmployeeDetails(prev => ({
                        ...prev,
                        [doc.id]: {
                            name: employeeName,
                            position: data.position || '',
                            ...data
                        }
                    }));

                    return {
                        id: doc.id,
                        name: employeeName,
                        position: data.position || '',
                        ...data
                    };
                });
                setEmployees(employeesList);
            } catch (error) {
                console.error("Error fetching employees:", error);
                toast.error("Failed to load employees");
            }
        };
        fetchEmployees();
    }, []);

    const toggleRowExpansion = (employeeId) => {
        setExpandedRows(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            let reportData = [];
            const employeesToQuery = employeeFilter === 'all'
                ? employees
                : employees.filter(emp => emp.id === employeeFilter);

            // Group attendance by employee
            const employeeAttendanceMap = new Map();

            for (let employee of employeesToQuery) {
                try {
                    const attendanceRef = collection(firestore, 'Employees', employee.id, 'Attendance');
                    const q = query(
                        attendanceRef,
                        where('date', '>=', formattedStartDate),
                        where('date', '<=', formattedEndDate)
                    );

                    const querySnapshot = await getDocs(q);
                    const employeeAttendance = [];

                    querySnapshot.forEach((doc) => {
                        const attendance = doc.data();
                        employeeAttendance.push({
                            id: doc.id,
                            date: attendance.date,
                            status: attendance.status,
                            timestamp: attendance.timestamp?.toDate?.() || null
                        });
                    });

                    if (employeeAttendance.length > 0) {
                        employeeAttendanceMap.set(employee.id, {
                            employeeInfo: {
                                id: employee.id,
                                name: employee.name,
                                position: employee.position
                            },
                            attendanceRecords: employeeAttendance.sort((a, b) => new Date(b.date) - new Date(a.date))
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching attendance for employee ${employee.id}:`, error);
                }
            }

            // Convert map to array for rendering
            const groupedData = Array.from(employeeAttendanceMap.values());
            setAttendanceData(groupedData);

            if (groupedData.length === 0) {
                toast("No attendance records found for the selected criteria");
            } else {
                toast.success(`Fetched attendance records for ${groupedData.length} employees`);
            }
        } catch (err) {
            console.error('Error generating report:', err);
            toast.error("Error generating attendance report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutProvider>
            <Navbar />
            <Box height={70} />
            <Box sx={{ display: 'flex' }}>
                <SideNav />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 5,
                        transition: (theme) => theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        '&.expanded': {
                            marginLeft: { sm: `${drawerWidth}px` },
                            transition: (theme) => theme.transitions.create('margin', {
                                easing: theme.transitions.easing.easeOut,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        }
                    }}
                >
                    <Box sx={{ mb: 6 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: 'gray', fontSize: '0.9rem' }}
                        >
                            {getBreadcrumb()}
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ color: '#1E1E1E', mb: 0.5 }}
                        >
                            Attendance Report
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth sx={{ maxWidth: 200 }} />}
                            />

                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth sx={{ maxWidth: 200 }} />}
                            />

                            <FormControl sx={{ minWidth: 215 }}>
                                <InputLabel>Employee</InputLabel>
                                <Select
                                    value={employeeFilter}
                                    onChange={(e) => setEmployeeFilter(e.target.value)}
                                    label="Employee"
                                >
                                    <MenuItem value="all">All Employees</MenuItem>
                                    {employees.map(emp => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.name} 
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                onClick={generateReport}
                                disabled={loading}
                                sx={{ height: 56 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                            </Button>
                        </Box>
                    </LocalizationProvider>

                    {attendanceData.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: 'center' }}>Employee Name</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>Total Records</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>First Record</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>Last Record</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>Today's Status</TableCell> 
                                        <TableCell sx={{ textAlign: 'center' }}>More Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceData.map(({ employeeInfo, attendanceRecords }) => {
                                        const today = new Date().toLocaleDateString();
                                        const todaysRecord = attendanceRecords.find(
                                            (record) => new Date(record.date).toLocaleDateString() === today
                                        );
                                        const todaysStatus = todaysRecord ? todaysRecord.status.toUpperCase() : 'N/A';
                                        const todaysStatusColor = todaysRecord
                                            ? todaysRecord.status === 'present'
                                                ? 'green'
                                                : todaysRecord.status === 'absent'
                                                    ? 'red'
                                                    : 'orange'
                                            : 'inherit';

                                        return (
                                            <React.Fragment key={employeeInfo.id}>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: 'center' }}>{employeeInfo.name}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{attendanceRecords.length}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {attendanceRecords[attendanceRecords.length - 1]?.date}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {attendanceRecords[0]?.date}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center', color: todaysStatusColor, fontWeight: 'bold' }}>
                                                        {todaysStatus}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleRowExpansion(employeeInfo.id)}
                                                        >
                                                            {expandedRows[employeeInfo.id] ? (
                                                                <KeyboardArrowUpIcon />
                                                            ) : (
                                                                <KeyboardArrowDownIcon />
                                                            )}
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                                {/* ... Collapse component remains the same ... */}
                                                <TableRow>
                                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}> {/* Increased colSpan */}
                                                        <Collapse in={expandedRows[employeeInfo.id]} timeout="auto" unmountOnExit>
                                                            <Box sx={{ margin: 2 }}>
                                                                <Typography variant="h6" gutterBottom component="div" sx={{ textAlign: 'center' }}>
                                                                    Detailed Attendance for {employeeInfo.name}
                                                                </Typography>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell sx={{ textAlign: 'center' }}>Date</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>Status</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>Time</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {attendanceRecords.map((record) => (
                                                                            <TableRow key={`${employeeInfo.id}-${record.date}`}>
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
                                                                                    {record.timestamp
                                                                                        ? record.timestamp.toLocaleTimeString()
                                                                                        : 'N/A'}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            No attendance records found. Try adjusting your filters.
                        </Typography>
                    )}
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default AttendanceReport;