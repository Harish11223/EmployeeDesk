import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutProvider } from '../../components/LayoutContext';
import EmployeeNavbar from '../../components/EmployeeNavbar';
import EmployeeSideNav from '../../components/EmployeeSideNav';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from '../../firebase-config';
import { toast } from 'react-hot-toast';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    TextareaAutosize
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const drawerWidth = 240;

function LeaveRequest() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
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

    const submitLeaveRequest = async () => {
        if (!startDate || !endDate || !reason) {
            toast.error('Please fill all fields');
            return;
        }

        if (startDate > endDate) {
            toast.error('End date must be after start date');
            return;
        }

        setLoading(true);
        try {
            const employeeId = auth.currentUser.uid;
            const employeeRef = doc(firestore, 'Employees', employeeId);
            const leaveRequestsCol = collection(employeeRef, 'LeaveRequests');

            await addDoc(leaveRequestsCol, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                reason,
                status: 'pending',
                createdAt: serverTimestamp(),             
            });

            toast.success('Leave request submitted successfully!');
            // navigate('/employeedash');
        } catch (error) {
            console.error('Error submitting leave request:', error);
            toast.error('Failed to submit leave request');
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
                            Leave Request
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box sx={{ maxWidth: 1800, mx: 'auto', mt: 4 }}>
                                {/* <Typography variant="h4" gutterBottom>
                                    Apply for Leave
                                </Typography> */}

                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                        <DatePicker
                                            label="Start Date"
                                            value={startDate}
                                            onChange={(newValue) => setStartDate(newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                        />
                                        <DatePicker
                                            label="End Date"
                                            value={endDate}
                                            onChange={(newValue) => setEndDate(newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                            minDate={startDate}
                                        />
                                    </Box>

                                    <TextField
                                        label="Reason for Leave"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        sx={{ mb: 3 }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={submitLeaveRequest}
                                        disabled={loading}
                                        fullWidth
                                        size="large"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Leave Request'}
                                    </Button>
                                </Paper>
                            </Box>
                        </LocalizationProvider>
                    </Box>
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default LeaveRequest;