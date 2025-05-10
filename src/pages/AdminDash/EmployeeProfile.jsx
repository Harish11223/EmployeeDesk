import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { firestore } from "../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { Divider, Avatar, Paper } from '@mui/material';

const drawerWidth = 240;

function EmployeeProfile() {
  const { employeeId } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getBreadcrumb = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const adminDashIndex = pathParts.indexOf('admindash');

    // Remove everything before 'admindash' if it exists
    const filteredPathParts = adminDashIndex > -1 ? pathParts.slice(adminDashIndex) : pathParts;
    const finalPathParts = [];
    for (let i = 0; i < filteredPathParts.length; i++) {
      finalPathParts.push(filteredPathParts[i]);
      if (filteredPathParts[i] === 'employee-profile') {
        break; // Stop after 'employee-profile'
      }
    }
    const capitalized = finalPathParts.map(p =>
      p === 'admindash' ? 'Home' : p.charAt(0).toUpperCase() + p.slice(1)
    );
    return (
      <>
        <Link to="/admindash" style={{ color: '#333', textDecoration: 'none' }}>
          Home
        </Link>
        {finalPathParts.length > 1 ? ' > ' : ''}{capitalized.slice(1).join(' > ')}
      </>
    );
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const docRef = doc(firestore, "Employees", employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEmployeeData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such employee document!");
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  if (loading) {
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
            <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'gray', fontSize: '0.9rem', mb: 0.5 }}
                >
                  {getBreadcrumb()}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: '#1E1E1E', mb: 0.5 }}
                >
                  Employee Profile
                </Typography>
              </Box>

              <Box sx={{ bgcolor: 'background.default', py: 4 }}>
                <Box className="container mx-auto">
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
                              bgcolor: 'primary.main'
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


                          <Typography variant="body2" component="h2" fontWeight="bold" className="flex items-center">
                            {employeeData.jobRole}
                          </Typography>
                          <Typography variant="body2" component="h2" fontWeight="bold" className="flex items-center">
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
                          {/* Column 1 */}
                          <Box>
                            <DetailItem
                              label="Full Name"
                              value={`${employeeData.firstName} ${employeeData.middleName || ''} ${employeeData.lastName}`}
                            />
                            <DetailItem label="Email" value={employeeData.email} />
                            <DetailItem label="Phone" value={employeeData.phoneNumber} />
                            <DetailItem label="Address" value={employeeData.address} />
                          </Box>

                          {/* Column 2 */}
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

                        {/* Additional Sections */}
                        {employeeData.certifications && (
                          <Box className="mt-6">
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center">

                              Certifications
                            </Typography>
                            <Typography variant="body2" className="text-gray-700">
                              {employeeData.certifications}
                            </Typography>
                          </Box>
                        )}

                        {employeeData.achievements && (
                          <Box className="mt-6">
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center">

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
        </Box>
      </LayoutProvider>
    </>
  );
}

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

export default EmployeeProfile;