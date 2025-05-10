import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InfoIcon from '@mui/icons-material/Info';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase-config';

const drawerWidth = 240;

function AdminDashboard() {
  const location = useLocation();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [fullTimeEmployees, setFullTimeEmployees] = useState(0);
  const [internEmployees, setInternEmployees] = useState(0);

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

  const fetchTotalEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "Employees"));
      setTotalEmployees(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchFullTimeEmployees = async () => {
    try {
      const q = query(collection(firestore, "Employees"), where("employmentType", "==", "FTE"));
      const querySnapshot = await getDocs(q);
      setFullTimeEmployees(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching full-time employees:", error);
    }
  };

  const fetchInternEmployees = async () => {
    try {
      const q = query(collection(firestore, "Employees"), where("employmentType", "==", "Intern"));
      const querySnapshot = await getDocs(q);
      setInternEmployees(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching intern employees:", error);
    }
  };

  useEffect(() => {
    fetchTotalEmployees();
    fetchFullTimeEmployees();
    fetchInternEmployees();
  }, []);

  return (
    <>
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
            <Box sx={{ mb: 3 }}>
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
                Admin Dashboard
              </Typography>
            </Box>

            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                padding: 2,
                mb: 4,
                backgroundColor: '#f9f9f9',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <InfoIcon sx={{ fontSize: '1.2rem', color: '#333', mr: 1 }} />
              <Typography variant="body1" sx={{ color: '#333' }}>
                Welcome to Admin Dashboard !
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    minWidth: '49%',
                    height: 120,
                    background: 'rgb(70, 128, 255)',
                    color: 'white',
                    boxShadow: 3,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.02)',
                    },
                    '&:hover .hoverIcon': {
                      color: 'white',
                      transform: 'scale(1.05)',
                      opacity: 1,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>{totalEmployees}</Box>
                      <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Total Employees</Box>
                    </Box>
                    <PeopleAltIcon
                      className="hoverIcon"
                      sx={{
                        fontSize: 40,
                        color: '',
                        opacity: 0.5,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    minWidth: '49%',
                    height: 120,
                    background: 'rgb(62, 201, 214)',
                    color: 'white',
                    boxShadow: 3,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.02)',
                    },
                    '&:hover .hoverIcon': {
                      color: 'white',
                      transform: 'scale(1.05)',
                      opacity: 1,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>{fullTimeEmployees}</Box>
                      <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Full-Time Employees</Box>
                    </Box>
                    <PeopleAltIcon
                      className="hoverIcon"
                      sx={{
                        fontSize: 40,
                        color: '',
                        opacity: 0.5,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    minWidth: '49%',
                    height: 120,
                    background: 'rgb(62, 72, 83)',
                    color: 'white',
                    boxShadow: 3,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.02)',
                    },
                    '&:hover .hoverIcon': {
                      color: 'white',
                      transform: 'scale(1.05)',
                      opacity: 1,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>{internEmployees}</Box>
                      <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Intern Employees</Box>
                    </Box>
                    <PeopleAltIcon
                      className="hoverIcon"
                      sx={{
                        fontSize: 40,
                        color: '',
                        opacity: 0.5,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box height={20} />
            <Grid container spacing={2}>
              <Grid size={8}>

              </Grid>
              <Grid size={4}>

              </Grid>
            </Grid>
          </Box>
        </Box>
      </LayoutProvider>
    </>
  );
};

export default AdminDashboard;
