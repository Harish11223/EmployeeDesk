import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from "react-router-dom";
import EmployeeSideNav from '../../components/EmployeeSideNav';
import EmployeeNavbar from '../../components/EmployeeNavbar';
import { LayoutProvider } from '../../components/LayoutContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import { firestore, auth } from "../../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { query, where, collection, getDocs } from "firebase/firestore";
import { Divider, Avatar, Paper } from '@mui/material';

const drawerWidth = 240;

function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(firestore, "Employees"),
            where("email", "==", user.email)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            setEmployeeData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such employee document!");
          }
        } catch (error) {
          console.error("Error fetching employee data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("No user is signed in");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  if (loading) {
    return (
      <>
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
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </Box>
          </Box>
        </LayoutProvider>
      </>
    );
  }

  if (!employeeData) {
    return (
      <>
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
              <div className="text-center py-8 text-red-500">
                Employee not found
              </div>
            </Box>
          </Box>
        </LayoutProvider>
      </>
    );
  }

  return (
    <>
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
            <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1, mb: 2 }}>
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
                Employee Dashboard
              </Typography>
            </Box>

            <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
              {/* Welcome Message */}
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
                  Welcome to Employee Dashboard !
                </Typography>
              </Box>

              {/* Dashboard Details */}
              <Box sx={{ bgcolor: 'background.default' }}>
                <Paper elevation={3} className="rounded-xl overflow-hidden">
                  <Box className="flex flex-col lg:flex-row">
                    {/* Left Side - Profile Card */}
                    <Box className="w-full lg:w-1/3 p-6 bg-gradient-to-b from-blue-50 to-white">
                      <Box className="flex flex-col items-center m-10">
                        <Avatar
                          src={employeeData.imageUrl}
                          alt={`${employeeData.firstName} ${employeeData.lastName}`}
                          sx={{
                            width: 120,
                            height: 120,
                            mb: 3,
                            fontSize: '3rem',
                            bgcolor: 'primary.main',
                          }}
                        >
                          {!employeeData.imageUrl &&
                            `${employeeData.firstName?.charAt(0)}${employeeData.lastName?.charAt(0)}`}
                        </Avatar>

                        <Typography
                          component="h2"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            fontSize: {
                              xs: '1.25rem',
                              sm: '1.25rem',
                              lg: '1.5rem',
                              xl: '1.5rem',
                            }
                          }}
                        >
                          {employeeData.firstName} {employeeData.middleName} {employeeData.lastName}
                        </Typography>

                        <Typography variant="body2" fontWeight="bold" className="flex items-center">
                          {employeeData.jobRole}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" className="flex items-center">
                          {employeeData.employmentType}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right Side - Details */}
                    <Box className="w-full lg:w-2/3 p-6">
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Employee Details
                      </Typography>

                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Box>
                          <DetailItem label="Full Name" value={`${employeeData.firstName} ${employeeData.middleName || ''} ${employeeData.lastName}`} />
                          <DetailItem label="Email" value={employeeData.email} />
                          <DetailItem label="Phone" value={employeeData.phoneNumber} />
                          <DetailItem label="Address" value={employeeData.address} />
                        </Box>

                        <Box>
                          <DetailItem label="Skills" value={employeeData.skills} />
                          <DetailItem label="Experience" value={employeeData.internships} />
                          <DetailItem label="Education" value={employeeData.highestEducation} />
                          <DetailItem
                            label="Date of Joining"
                            value={
                              employeeData.joiningDate?.toDate?.()?.toLocaleDateString() ||
                              employeeData.joiningDate
                            }
                          />
                        </Box>
                      </Box>

                      {employeeData.certifications && (
                        <Box className="mt-6">
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Certifications
                          </Typography>
                          <Typography variant="body2" className="text-gray-700">
                            {employeeData.certifications}
                          </Typography>
                        </Box>
                      )}

                      {employeeData.achievements && (
                        <Box className="mt-6">
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Achievements
                          </Typography>
                          <Typography variant="body2" className="text-gray-700">
                            {employeeData.achievements}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>


          </Box>
        </Box>
      </LayoutProvider>
    </>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <Box className="mb-4">
    <Typography variant="caption" className="flex items-center text-gray-500">
      {icon && <span className="material-icons-outlined mr-2 text-sm">{icon}</span>}
      {label}
    </Typography>
    <Typography variant="body1" className="font-medium">
      {value || 'Not specified'}
    </Typography>
    <Divider className="my-2" />
  </Box>
);

export default EmployeeDashboard;
