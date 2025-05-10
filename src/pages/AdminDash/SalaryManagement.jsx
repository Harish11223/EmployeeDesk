import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { toast } from 'react-hot-toast';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const drawerWidth = 240;

function SalaryManagement() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [basicSalary, setBasicSalary] = useState('');
    const [allowances, setAllowances] = useState('');
    const [deductions, setDeductions] = useState('');
    const [payDate, setPayDate] = useState(new Date());
    const [incrementPercent, setIncrementPercent] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSalary, setCurrentSalary] = useState(null);

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
                const employeesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEmployees(employeesList);
            } catch (error) {
                console.error("Error fetching employees:", error);
                toast.error("Failed to load employees");
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchCurrentSalary();
        } else {
            // Clear salary data when no employee is selected
            setCurrentSalary(null);
        }
    }, [selectedEmployee]);

    const fetchCurrentSalary = async () => {
        try {
            const salaryRef = doc(firestore, 'Employees', selectedEmployee, 'Salary', 'current');
            const salarySnap = await getDoc(salaryRef);

            if (salarySnap.exists()) {
                setCurrentSalary(salarySnap.data());
                setBasicSalary(salarySnap.data().basicSalary);
                setAllowances(salarySnap.data().allowances);
                setDeductions(salarySnap.data().deductions);
            } else {
                setCurrentSalary(null);
                setBasicSalary('');
                setAllowances('');
                setDeductions('');
            }
        } catch (error) {
            console.error("Error fetching current salary:", error);
            toast.error("Failed to load current salary");
        }
    };

    const calculateInHandSalary = () => {
        const basic = parseFloat(basicSalary) || 0;
        const allowance = parseFloat(allowances) || 0;
        const deduction = parseFloat(deductions) || 0;
        return ((basic + allowance - deduction) / 12).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!selectedEmployee) {
                toast.error("Please select an employee");
                return;
            }

            const inHandSalary = calculateInHandSalary();
            const increment = parseFloat(incrementPercent) || 0;

            // Calculate new basic salary if increment is provided
            let newBasicSalary = parseFloat(basicSalary);
            if (increment > 0 && currentSalary) {
                newBasicSalary = currentSalary.basicSalary * (1 + increment / 100);
                setBasicSalary(newBasicSalary.toFixed(2));
            }

            // Prepare salary data
            const salaryData = {
                employeeId: selectedEmployee,
                employeeName: employees.find(e => e.id === selectedEmployee)?.name || 'Unknown',
                basicSalary: newBasicSalary,
                allowances: parseFloat(allowances) || 0,
                deductions: parseFloat(deductions) || 0,
                inHandSalary: parseFloat(inHandSalary),
                payDate: payDate.toISOString().split('T')[0],
                updatedAt: new Date(),
                incrementPercent: increment
            };

            // Update current salary
            const currentSalaryRef = doc(firestore, 'Employees', selectedEmployee, 'Salary', 'current');
            await setDoc(currentSalaryRef, salaryData);

            // Add to salary history
            const historyRef = doc(collection(firestore, 'Employees', selectedEmployee, 'SalaryHistory'));
            await setDoc(historyRef, salaryData);

            toast.success(`Salary ${currentSalary ? 'updated' : 'added'} successfully!`);
            fetchCurrentSalary();
        } catch (error) {
            console.error("Error saving salary:", error);
            toast.error("Failed to save salary");
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
                            Salary Management
                        </Typography>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box>
                            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                    {currentSalary ? 'Update Salary' : 'Add New Salary'}
                                </Typography>

                                <form onSubmit={handleSubmit}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 3,
                                            '& > *': {
                                                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
                                            },
                                        }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Select Employee</InputLabel>
                                            <Select
                                                value={selectedEmployee}
                                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                                label="Select Employee"
                                                required
                                            >
                                                <MenuItem value="">Select an employee</MenuItem>
                                                {employees.map(employee => (
                                                    <MenuItem key={employee.id} value={employee.id}>
                                                        {employee.firstName} {employee.middleName} {employee.lastName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Basic Salary"
                                            type="number"
                                            value={basicSalary}
                                            onChange={(e) => setBasicSalary(e.target.value)}
                                            required
                                            fullWidth
                                            disabled={!selectedEmployee}
                                        />

                                        <TextField
                                            label="Allowances"
                                            type="number"
                                            value={allowances}
                                            onChange={(e) => setAllowances(e.target.value)}
                                            fullWidth
                                            disabled={!selectedEmployee}
                                        />

                                        <TextField
                                            label="Deductions"
                                            type="number"
                                            value={deductions}
                                            onChange={(e) => setDeductions(e.target.value)}
                                            fullWidth
                                            disabled={!selectedEmployee}
                                        />

                                        <DatePicker
                                            label="Pay Date"
                                            value={payDate}
                                            onChange={(newValue) => setPayDate(newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth disabled={!selectedEmployee} />}
                                            disabled={!selectedEmployee}
                                        />

                                        <TextField
                                            label="Increment Percentage (optional)"
                                            type="number"
                                            value={incrementPercent}
                                            onChange={(e) => setIncrementPercent(e.target.value)}
                                            helperText="Enter percentage to increment basic salary"
                                            fullWidth
                                            disabled={!selectedEmployee}
                                        />

                                        <Box
                                            sx={{
                                                p: 2,
                                                border: '1px dashed #ccc',
                                                borderRadius: 1,
                                                flex: '1 1 100%',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="subtitle1">
                                                In-hand Salary: ₹{selectedEmployee ? calculateInHandSalary() : '0.00'}
                                            </Typography>

                                        </Box>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            disabled={loading || !selectedEmployee}
                                            fullWidth
                                            sx={{ flex: '1 1 100%' }}
                                        >
                                            {loading ? 'Processing...' : currentSalary ? 'Update Salary' : 'Add Salary'}
                                        </Button>
                                    </Box>
                                </form>
                            </Paper>

                            {selectedEmployee && currentSalary && (
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Current Salary Details
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Component</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Basic Salary</TableCell>
                                                    <TableCell align="right">{currentSalary.basicSalary}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Allowances</TableCell>
                                                    <TableCell align="right">{currentSalary.allowances}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Deductions</TableCell>
                                                    <TableCell align="right">{currentSalary.deductions}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>In-hand Salary</strong></TableCell>
                                                    <TableCell align="right"><strong>{currentSalary.inHandSalary}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </Box>
                    </LocalizationProvider>
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default SalaryManagement;