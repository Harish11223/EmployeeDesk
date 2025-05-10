import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { firestore, auth } from "../../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const drawerWidth = 240;

function Employees() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Employees"));
        const dataList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(dataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (employeeId) => {
    navigate(`/admindash/employee-profile/${employeeId}`);
  };

  const filteredData = data.filter((item) =>
    (item.firstName && item.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.middleName && item.middleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.lastName && item.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.skills && item.skills.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.achievements && item.achievements.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.gender && item.gender.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.city && item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.grade && item.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.internships && item.internships.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.jobRole && item.jobRole.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.employmentType && item.employmentType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // console.log("Filtered data:", filteredData); // Log filtered data

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
                Employees
              </Typography>
            </Box>

            <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
              <div className="mt-6">
                <label className="text-lg font-semibold text-slate-600">Search Filter</label>
                <input
                  type="text"
                  id="search_term"
                  className="w-full size-13 mb-6 px-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  placeholder="Search by Name/Employee id/Skills/Achievements/Experience"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-slate-300 shadow-sm rounded-md overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 text-sm font-medium">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Employment Type</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Skills</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Job Role</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Highest Education</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr
                          key={item.id}
                          onClick={() => handleRowClick(item.id)}
                          className={`cursor-pointer hover:bg-slate-100 transition duration-200 ease-in-out ${index % 2 === 0 ? 'bg-slate-50' : ''}`}
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">{item.firstName} {item.middleName} {item.lastName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.employmentType}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.skills}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.jobRole}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.highestEducation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Box>

          </Box>
        </Box>
      </LayoutProvider>
    </>
  );
};

export default Employees;
