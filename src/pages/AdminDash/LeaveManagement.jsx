import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { toast } from 'react-hot-toast';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Select,
    MenuItem,
    Collapse,
    IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const drawerWidth = 240;

function LeaveManagement() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRows, setExpandedRows] = useState({});

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

    const toggleRowExpansion = (employeeId) => {
        setExpandedRows(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [statusFilter]);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const employeesCol = collection(firestore, 'Employees');
            const employeesSnapshot = await getDocs(employeesCol);

            const allRequests = [];

            for (const employeeDoc of employeesSnapshot.docs) {
                const employeeData = employeeDoc.data();
                const employeeName = `${employeeData.firstName || ''} ${employeeData.middleName || ''} ${employeeData.lastName || ''}`.trim() || 'Unnamed Employee';

                const leaveRequestsCol = collection(employeeDoc.ref, 'LeaveRequests');
                let q = leaveRequestsCol;

                if (statusFilter !== 'all') {
                    q = query(leaveRequestsCol, where('status', '==', statusFilter));
                }

                const requestsSnapshot = await getDocs(q);

                requestsSnapshot.forEach(requestDoc => {
                    const requestData = requestDoc.data();
                    allRequests.push({
                        id: requestDoc.id,
                        employeeId: employeeDoc.id,
                        employeeName,
                        position: employeeData.position || '',
                        ...requestData,
                        createdAt: requestData.createdAt?.toDate() || new Date(),
                        reviewedAt: requestData.reviewedAt?.toDate() || null
                    });
                });
            }

            // Sort by creation date (newest first)
            allRequests.sort((a, b) => b.createdAt - a.createdAt);
            setLeaveRequests(allRequests);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const updateLeaveStatus = async (requestId, employeeId, status) => {
        try {
            const requestRef = doc(firestore, 'Employees', employeeId, 'LeaveRequests', requestId);
            await updateDoc(requestRef, {
                status,
                reviewedAt: new Date()
            });

            toast.success(`Leave request ${status}`);
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error updating leave status:', error);
            toast.error('Failed to update leave status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                    <Box sx={{ mb: 4 }}>
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
                            Leave Management
                        </Typography>
                    </Box>

                    <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="all">All Requests</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>

                            <Button
                                variant="outlined"
                                onClick={fetchLeaveRequests}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Employee</TableCell>
                                        <TableCell>Leave Period</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Submitted On</TableCell>
                                        <TableCell>Actions</TableCell>
                                        <TableCell>More Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaveRequests.map((request) => (
                                        <React.Fragment key={`${request.employeeId}-${request.id}`}>
                                            <TableRow>
                                                <TableCell>{request.employeeName}</TableCell>
                                                <TableCell>
                                                    {formatDate(new Date(request.startDate))} to {formatDate(new Date(request.endDate))}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={request.status}
                                                        color={getStatusColor(request.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(request.createdAt)}</TableCell>
                                                <TableCell>
                                                    {request.status === 'pending' ? (
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => updateLeaveStatus(request.id, request.employeeId, 'approved')}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => updateLeaveStatus(request.id, request.employeeId, 'rejected')}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                const newStatus = request.status === 'approved' ? 'rejected' : 'approved';
                                                                updateLeaveStatus(request.id, request.employeeId, newStatus);
                                                            }}
                                                        >
                                                            Change Decision
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleRowExpansion(request.id)}
                                                    >
                                                        {expandedRows[request.id] ? (
                                                            <KeyboardArrowUpIcon />
                                                        ) : (
                                                            <KeyboardArrowDownIcon />
                                                        )}
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                    <Collapse in={expandedRows[request.id]} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Leave Details
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                <Typography><strong>Reason:</strong> {request.reason}</Typography>
                                                                <Typography><strong>Reviewed On:</strong> {request.reviewedAt ? formatDate(request.reviewedAt) : 'Not reviewed'}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {leaveRequests.length === 0 && !loading && (
                            <Typography sx={{ mt: 2, textAlign: 'center' }}>
                                No leave requests found
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default LeaveManagement;