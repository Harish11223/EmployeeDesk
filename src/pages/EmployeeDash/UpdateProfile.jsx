import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutProvider } from '../../components/LayoutContext';
import EmployeeNavbar from '../../components/EmployeeNavbar';
import EmployeeSideNav from '../../components/EmployeeSideNav';
import {
    collection,
    addDoc,
    getDocs,
    where,
    query,
    updateDoc,
} from 'firebase/firestore';
import { firestore, auth } from '../../firebase-config';
import { toast } from 'react-hot-toast';
import { Box, Typography } from '@mui/material';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const drawerWidth = 240;

function UpdateProfile() {
    const [FormData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        skills: "",
        certifications: "",
        employmentType: "",
        jobRole: "",
        joiningDate: "",
        gender: "",
        address: "",
        phoneNumber: "",
        city: "",
        state: "",
        zip: "",
        highestEducation: "",
        educationStatus: "",
        grade: "",
        internships: "",
        achievements: "",
    });

    const [currentUserData, setCurrentUserData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Check if the user already has a document in Firestore
            const userQuery = query(
                collection(firestore, "Employees"),
                where("email", "==", auth.currentUser.email)
            );
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.empty) {
                // If no document found, create a new one
                const docRef = await addDoc(collection(firestore, "Employees"), {
                    ...FormData,
                    uid: auth.currentUser.uid,
                });
                // console.log("Document written with ID: ", docRef.id);
                toast.success("Details Updated Successfully!");
            } else {
                // If document found, update the existing document
                querySnapshot.forEach((doc) => {
                    updateDoc(doc.ref, {
                        ...FormData,
                        uid: auth.currentUser.uid,
                        updatedAt: new Date(),
                    });
                });
                toast.success("Details Updated Successfully!");
            }
        } catch (e) {
            console.error("Error adding/updating document: ", e);
            toast.error("An error has occurred while saving your details.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...FormData, [name]: value });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userQuery = query(
                    collection(firestore, "Employees"),
                    where("email", "==", auth.currentUser.email)
                );
                const querySnapshot = await getDocs(userQuery);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        setFormData(doc.data());
                        setCurrentUserData(doc.data());
                    });
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        if (auth.currentUser) {
            fetchUserData();
        }
    }, []);

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
                            Update Profile
                        </Typography>

                        <Box sx={{ maxWidth: '1800px', mx: 'auto', px: 1 }}>
                            <div className="flex items-center justify-center ">
                                <div className="relative flex w-full mx-auto flex-col rounded-lg bg-white border border-slate-200 shadow-sm">
                                    <div className="p-6">
                                        <div className="block">
                                            <div className="relative block w-full  bg-transparent">
                                                <div role="tabpanel" data-value="card">

                                                    <div className="flex justify-center mb-6">
                                                        <div className="group relative inline-block">
                                                            <h3 className="text-2xl font-semibold text-slate-800 pb-2">
                                                                Employee Details
                                                            </h3>
                                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-slate-500 transition-all duration-300 ease-in-out group-hover:left-0 group-hover:translate-x-0 group-hover:w-full group-hover:bg-gray-700"></span>
                                                        </div>
                                                    </div>

                                                    <form className="mt-8 flex flex-col" onSubmit={handleSubmit} >

                                                        <legend className="bg-[rgba(70,128,255,0.2)] text-slate-800 font-semibold text-base px-3 py-1 rounded-md">
                                                            Employee Information
                                                        </legend>

                                                        <div className="flex">
                                                            <div className="w-full  md:w-4/12 mr-4">
                                                                <label className="form-label block mb-1 text-sm text-slate-600 mt-4" htmlFor="fname" >
                                                                    First Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="First"
                                                                    id="fname"
                                                                    name="firstName"
                                                                    value={FormData.firstName}
                                                                    onChange={handleInputChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-4/12 mr-4">
                                                                <label className="form-label block mb-1 text-sm text-slate-600 mt-4" htmlFor="mname">
                                                                    Middle Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="Middle"
                                                                    id="mname"
                                                                    name="middleName"
                                                                    value={FormData.middleName}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-4/12">
                                                                <label className="form-label block mb-1 text-sm text-slate-600 mt-4" htmlFor="lname">
                                                                    Last Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="Last"
                                                                    id="lname"
                                                                    aria-describedby="inputGroupPrepend2"
                                                                    name="lastName"
                                                                    value={FormData.lastName}
                                                                    onChange={handleInputChange}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/2 mr-4">
                                                                <label className="form-label block mb-1 text-sm text-slate-600 mt-4" htmlFor="email">
                                                                    Email
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    className="form-control w-full bg-gray-100 cursor-not-allowed text-gray-500 placeholder:text-slate-400 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none shadow-sm"
                                                                    placeholder="Email"
                                                                    id="email"
                                                                    name="email"
                                                                    value={FormData.email}
                                                                    readOnly
                                                                />

                                                            </div>
                                                            <div className="w-full md:w-1/2">
                                                                <label className="form-label block mb-1 text-sm text-slate-600 mt-4" htmlFor="Password">
                                                                    Password
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPassword ? "text" : "password"}
                                                                        value={FormData.password}
                                                                        id="Password"
                                                                        name="password"
                                                                        placeholder="*********"
                                                                        autoComplete="new-password"
                                                                        readOnly
                                                                        className="form-control w-full bg-gray-100 cursor-not-allowed text-gray-500 placeholder:text-slate-400 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none shadow-sm"
                                                                    />
                                                                    <span
                                                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 cursor-not-allowed"
                                                                    >
                                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/2 mr-4">
                                                                <label htmlFor="skills" className="form-label mt-4 block mb-1 text-sm text-slate-600">
                                                                    Skills
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id="skills"
                                                                    name="skills"
                                                                    value={FormData.skills}
                                                                    onChange={handleInputChange}
                                                                    // required
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="e.g C/C++"
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-1/2 mr-4">
                                                                <label htmlFor="certifications" className="form-label mt-4 block mb-1 text-sm text-slate-600">
                                                                    Certifications
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id="certifications"
                                                                    name="certifications"
                                                                    value={FormData.certifications}
                                                                    onChange={handleInputChange}
                                                                    // required
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="e.g AI/ML, Web Dev"
                                                                />
                                                            </div>
                                                        </div>


                                                        <div className="flex">
                                                            <div className="w-full md:w-2/5 mr-4">
                                                                <label htmlFor="employmentType" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Employment Type
                                                                </label>
                                                                <select
                                                                    id="employmentType"
                                                                    name="employmentType"
                                                                    value={FormData.employmentType}
                                                                    disabled
                                                                    className="form-select w-full bg-gray-100 text-gray-500 cursor-not-allowed text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease shadow-sm"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="FTE">Full Time</option>
                                                                    <option value="Intern">Intern</option>
                                                                </select>

                                                            </div>
                                                            <div className="w-full md:w-2/5 mr-4">
                                                                <label htmlFor="jobRole" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Job Role
                                                                </label>
                                                                <select
                                                                    id="jobRole"
                                                                    name="jobRole"
                                                                    value={FormData.jobRole}
                                                                    disabled
                                                                    className="form-select w-full bg-gray-100 text-gray-500 cursor-not-allowed text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease shadow-sm"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <optgroup label="Software Development">
                                                                        <option value="Software Engineer">Software Engineer</option>
                                                                        <option value="Software Developer">Software Developer</option>
                                                                        <option value="Front-End Developer">Front-End Developer</option>
                                                                        <option value="Back-End Developer">Back-End Developer</option>
                                                                        <option value="Full-Stack Developer">Full-Stack Developer</option>
                                                                        <option value="Mobile App Developer">Mobile App Developer</option>
                                                                        <option value="Web Developer">Web Developer</option>
                                                                        <option value="Application Developer">Application Developer</option>
                                                                    </optgroup>
                                                                    <optgroup label="Data">
                                                                        <option value="Data Scientist">Data Scientist</option>
                                                                        <option value="Data Analyst">Data Analyst</option>
                                                                        <option value="Data Engineer">Data Engineer</option>
                                                                        <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                                                        <option value="Database Administrator">Database Administrator</option>
                                                                    </optgroup>                                                             

                                                                </select>
                                                            </div>
                                                            <div className="w-full md:w-1/5">
                                                                <label htmlFor="joiningDate" className="form-label mt-4 block mb-1 text-sm text-slate-600">
                                                                    Date Of Joining
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    id="joiningDate"
                                                                    name="joiningDate"
                                                                    value={FormData.joiningDate}
                                                                    disabled
                                                                    className="form-control w-full bg-gray-100 text-gray-500 cursor-not-allowed text-sm border border-slate-200 rounded-md pl-3 pr-3 py-2 transition duration-300 ease shadow-sm"
                                                                    placeholder="YYYY-MM-DD"
                                                                />

                                                            </div>
                                                        </div>

                                                        <hr className="my-8 border-slate-300" />

                                                        <legend className="bg-[rgba(70,128,255,0.2)] text-slate-800 font-semibold text-base px-3 py-1 rounded-md">
                                                            More Details
                                                        </legend>

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/3 mr-4">
                                                                <label htmlFor="gender" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Gender
                                                                </label>
                                                                <select
                                                                    id="gender"
                                                                    name="gender"
                                                                    value={FormData.gender}
                                                                    onChange={handleInputChange}
                                                                    className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Others">Others</option>
                                                                </select>
                                                            </div>
                                                            <div className="w-full md:w-2/3 mr-4">
                                                                <label htmlFor="address" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Address
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="1234 Main St"
                                                                    id="Address"
                                                                    name="address"
                                                                    value={FormData.address}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-4/12">
                                                                <label htmlFor="phone" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Phone Number
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="1234567890"
                                                                    id="phone"
                                                                    name="phoneNumber"
                                                                    value={FormData.phoneNumber}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/3 mr-4">
                                                                <label htmlFor="city" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    City
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="city"
                                                                    id="city"
                                                                    name="city"
                                                                    value={FormData.city}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-3/5 mr-4">
                                                                <label htmlFor="state" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    State
                                                                </label>
                                                                <select
                                                                    id="state"
                                                                    name="state"
                                                                    className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    value={FormData.state}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="AP">Andhra Pradesh</option>
                                                                    <option value="AR">Arunachal Pradesh</option>
                                                                    <option value="AS">Assam</option>
                                                                    <option value="BR">Bihar</option>
                                                                    <option value="CT">Chhattisgarh</option>
                                                                    <option value="GA">Gujarat</option>
                                                                    <option value="HR">Haryana</option>
                                                                    <option value="HP">Himachal Pradesh</option>
                                                                    <option value="JK">Jammu and Kashmir</option>
                                                                    <option value="GA">Goa</option>
                                                                    <option value="JH">Jharkhand</option>
                                                                    <option value="KA">Karnataka</option>
                                                                    <option value="KL">Kerala</option>
                                                                    <option value="MP">Madhya Pradesh</option>
                                                                    <option value="MH">Maharashtra</option>
                                                                    <option value="MN">Manipur</option>
                                                                    <option value="ML">Meghalaya</option>
                                                                    <option value="MZ">Mizoram</option>
                                                                    <option value="NL">Nagaland</option>
                                                                    <option value="OR">Odisha</option>
                                                                    <option value="PB">Punjab</option>
                                                                    <option value="RJ">Rajasthan</option>
                                                                    <option value="SK">Sikkim</option>
                                                                    <option value="TN">Tamil Nadu</option>
                                                                    <option value="TG">Telangana</option>
                                                                    <option value="TR">Tripura</option>
                                                                    <option value="UT">Uttarakhand</option>
                                                                    <option value="UP">Uttar Pradesh</option>
                                                                    <option value="WB">West Bengal</option>
                                                                    <option value="CH">Chandigarh</option>
                                                                    <option value="DL">Delhi</option>
                                                                </select>
                                                            </div>
                                                            <div className="w-full md:w-4/12">
                                                                <label htmlFor="zip" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Zip
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="zip"
                                                                    id="zip"
                                                                    name="zip"
                                                                    value={FormData.zip}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* <hr className="my-8 border-slate-300" />
                        
                                                <legend className="bg-[rgba(70,128,255,0.2)] text-slate-800 font-semibold text-base px-3 py-1 rounded-md">
                                                  Academic Information
                                                </legend> */}

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/2 mr-4">
                                                                <label htmlFor="highestEducation" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Highest Education
                                                                </label>
                                                                <select
                                                                    id="highestEducation"
                                                                    name="highestEducation"
                                                                    className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    value={FormData.highestEducation}
                                                                    onChange={handleInputChange}
                                                                // required
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="High School">High School</option>
                                                                    <option value="Under Graduate">Under Graduate</option>
                                                                    <option value="Post Graduate">Post Graduate</option>
                                                                </select>
                                                            </div>
                                                            <div className="w-full md:w-4/12 mr-4">
                                                                <label htmlFor="educationStatus" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Status
                                                                </label>
                                                                <select
                                                                    id="educationStatus"
                                                                    name="educationStatus"
                                                                    className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    value={FormData.educationStatus}
                                                                    onChange={handleInputChange}
                                                                // required
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Completed">Completed</option>
                                                                    <option value="Pursuing">Pursuing</option>
                                                                </select>
                                                            </div>
                                                            <div className="w-full md:w-4/12">
                                                                <label htmlFor="grade" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    CGPA / Grade
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="grade"
                                                                    id="grade"
                                                                    name="grade"
                                                                    value={FormData.grade}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <div className="w-full md:w-1/2 mr-4">
                                                                <label htmlFor="internships" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Internships (if any)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="internships"
                                                                    id="internships"
                                                                    name="internships"
                                                                    value={FormData.internships}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-1/2">
                                                                <label htmlFor="achievements" className="form-label block mb-1 text-sm text-slate-600 mt-4">
                                                                    Achievements
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                                                    placeholder="achievements"
                                                                    id="achievements"
                                                                    name="achievements"
                                                                    value={FormData.achievements}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            id="submitform"
                                                            className="w-full mt-6 rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                                                            Update Data
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Box>

                    </Box>
                </Box>
            </Box>
        </LayoutProvider>
    );
}

export default UpdateProfile;
