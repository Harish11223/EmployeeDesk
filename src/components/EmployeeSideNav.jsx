import React, { useState, useEffect } from 'react';
import { MoreVertical } from "lucide-react";
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useLayout } from './LayoutContext';
import DashboardIcon from '../assets/dash.svg';
import LogoIcon from '../assets/bmw.svg';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { auth, firestore } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { Avatar, Menu, MenuItem } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    // boxShadow: '4px 0 15px -5px rgba(0, 0, 0, 0.1)',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    boxShadow: '3px 0 12px -4px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const navItems = [
    { text: 'Dashboard', path: '/employeedash', icon: <img src={DashboardIcon} alt="Dashboard" style={{ width: 24, height: 24 }} /> },
    { text: 'Profile', path: '/update-profile', icon: <PersonIcon/> },
    { text: 'Mark Attendance', path: '/mark-attendance', icon: <AssessmentIcon /> },
    { text: 'Leave Request', path: '/leave-request', icon: <ExitToAppIcon /> },
];

export default function Sidebar() {
    const theme = useTheme();
    const location = useLocation();
    const { expanded, setExpanded } = useLayout();
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        auth.signOut();
        navigate("/");
        handleClose();
    };

    const fetchEmployeeData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No authenticated user');
            }

            const docRef = doc(firestore, 'Employees', user.uid);

            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setEmployeeData(docSnap.data());
            } else {
                console.log('No employee data found');
                setEmployeeData({
                    firstName: 'Guest',
                    lastName: 'User',
                    email: user.email || 'No email',
                    imageUrl: null
                });
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setEmployeeData({
                firstName: 'Error',
                lastName: 'Loading Data',
                email: 'Could not load profile',
                imageUrl: null
            });
        }
    };

    useEffect(() => {
        // Add auth state listener to ensure user is loaded
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchEmployeeData();
            }
        });

        return () => unsubscribe();
    }, []);

    const handleNavigation = (path) => {
        expanded
            ? setExpanded(true)
            : setExpanded(false);

        navigate(path, { state: { preventSidebarExpand: !expanded } });
    };

    React.useEffect(() => {
        if (location.state?.preventSidebarExpand) {
            setExpanded(false);
        }
    }, [location, setExpanded]);

    return (
        <Drawer variant="permanent" open={expanded}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: '#ffffff',
            }}>
                {/* Header with Logo and Title */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: theme.spacing(2),
                    height: 64,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    justifyContent: 'center',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src={LogoIcon}
                            alt="Logo"
                            style={{
                                width: 40,
                                height: 40,
                                marginRight: expanded ? theme.spacing(1) : 0,
                                transition: 'margin 0.3s ease',
                            }}
                        />
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.25rem',
                                opacity: expanded ? 1 : 0,
                                width: expanded ? 'auto' : 0,
                                transition: 'opacity 0.3s ease, width 0.3s ease',
                                overflow: 'hidden',
                            }}
                        >
                            EmployeeDesk
                        </Typography>
                    </Box>
                </Box>

                {/* Navigation Items */}
                <List sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    py: 1,
                    height: `calc(100vh - 64px - ${expanded ? 72 : 56}px)`,
                }}>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: 'center',
                                    px: expanded ? 2.5 : 0,
                                    mx: expanded ? 1 : 0,
                                    borderRadius: '6px',
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(70, 128, 255, 0.1)',
                                        color: '#4680ff',
                                    },
                                }}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {expanded && (
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            ml: 2,
                                            '& .MuiTypography-root': {
                                                fontWeight: location.pathname === item.path ? '600' : '500',
                                            }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Footer Section */}
                <Box sx={{
                    p: expanded ? 2 : 1,
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: expanded ? 'flex-start' : 'center',
                    }}>
                        <Avatar
                            src={employeeData?.imageUrl || null}
                            alt={`${employeeData?.firstName || ''} ${employeeData?.lastName || ''}`}
                            sx={{
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                bgcolor: employeeData?.imageUrl ? 'transparent' : 'primary.main'
                            }}
                        >
                            {employeeData?.imageUrl ? null : (
                                employeeData
                                    ? `${employeeData.firstName?.charAt(0) || ''}${employeeData.lastName?.charAt(0) || ''}`
                                    : <AccountCircle />
                            )}
                        </Avatar>
                        {expanded && employeeData && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography noWrap variant="subtitle2">
                                            {employeeData?.firstName || ''} {employeeData?.lastName || ''}
                                        </Typography>
                                        <Typography noWrap variant="caption" color="text.secondary">
                                            {employeeData?.email || 'No email'}
                                        </Typography>
                                    </Box>

                                    <IconButton onClick={handleOpen} sx={{ ml: -0.5, color: '#666' }}>
                                        <MoreVertical />
                                    </IconButton>
                                </Box>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <MenuItem
                                        onClick={handleSignOut}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(70, 128, 255, 0.1)',
                                                color: '#4680ff',
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                        Sign Out
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Box>

            </Box>
        </Drawer>
    );
}