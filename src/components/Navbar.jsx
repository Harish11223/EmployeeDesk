import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '../assets/dash.svg';
import AvatarIcon from '../assets/avatar.png';
import { Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreIcon from '@mui/icons-material/MoreVert';
import MenuIcon from '@mui/icons-material/Menu';
import LockIcon from '@mui/icons-material/Lock';
import Button from '@mui/material/Button';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useLayout } from './LayoutContext';
import { auth } from "../firebase-config";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toast } from 'react-hot-toast';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer - 1,
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '10px',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    border: `1px solid ${alpha(theme.palette.common.black, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
        borderColor: alpha(theme.palette.common.black, 0.4),
    },
    marginRight: theme.spacing(0),
    marginLeft: theme.spacing(0),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

export default function Navbar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const { expanded, setExpanded } = useLayout();
    const navigate = useNavigate();
    const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleSignOut = () => {
        auth.signOut();
        navigate("/");
    };

    const handleChangePasswordClick = () => {
        setChangePasswordOpen(true);
        handleMenuClose();
    };

    const handleClosePasswordDialog = () => {
        setChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            setError("No user logged in");
            return;
        }

        try {
            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, newPassword);
            
            toast.success("Password changed successfully");
            handleClosePasswordDialog();
        } catch (err) {
            console.error("Error changing password:", err);
            setError(err.message || "Failed to change password");
        }
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem
                onClick={handleMenuClose}
                component={Link}
                to="/admindash"
                sx={{
                    '&:hover': {
                        backgroundColor: 'rgba(70, 128, 255, 0.1)',
                        color: '#4680ff',
                    },
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <img
                    src={DashboardIcon}
                    style={{ width: 24, height: 24, marginRight: 6, marginLeft: -4 }}
                    alt="Dashboard Icon"
                />
                Dashboard
            </MenuItem>

            <MenuItem
                onClick={handleChangePasswordClick}
                sx={{
                    '&:hover': {
                        backgroundColor: 'rgba(70, 128, 255, 0.1)',
                        color: '#4680ff',
                    },
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <EditNoteIcon fontSize="small" sx={{ mr: 1 }} />
                Change Password
            </MenuItem>

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
                Logout
            </MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem
                onClick={handleMenuClose}
                component={Link}
                to="/admindash"
                sx={{
                    '&:hover': {
                        backgroundColor: 'rgba(70, 128, 255, 0.1)',
                        color: '#4680ff',
                    },
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <img
                    src={DashboardIcon}
                    style={{ width: 24, height: 24, marginRight: 6, marginLeft: -4 }}
                    alt="Dashboard Icon"
                />
                Dashboard
            </MenuItem>

            <MenuItem
                onClick={handleChangePasswordClick}
                sx={{
                    '&:hover': {
                        backgroundColor: 'rgba(70, 128, 255, 0.1)',
                        color: '#4680ff',
                    },
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <LockIcon fontSize="small" sx={{ mr: 1 }} />
                Change Password
            </MenuItem>

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
                Logout
            </MenuItem>
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: 'white',
                    color: 'black',
                    boxShadow: 0,
                    width: expanded ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 57px)',
                    marginLeft: expanded ? `${drawerWidth}px` : '57px',
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 2,
                    }}
                >
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            ml: 2,
                            color: 'black',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Search sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>

                    <Box sx={{ flexGrow: 1 }} />
                    <Box
                        sx={{ display: { xs: 'none', md: 'flex' }, mr: { sm: 4 } }}
                    >
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                            sx={{
                                p: 0,
                                '&:hover': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            <Avatar
                                src={AvatarIcon}
                                alt="User Avatar"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    fontSize: '1rem',
                                    bgcolor: 'primary.main'
                                }}
                            />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}

            {/* Change Password Dialog */}
            <Dialog open={changePasswordOpen} onClose={handleClosePasswordDialog}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Current Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePasswordDialog}>Cancel</Button>
                    <Button 
                        onClick={handlePasswordChange}
                        variant="contained"
                        color="primary"
                    >
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}