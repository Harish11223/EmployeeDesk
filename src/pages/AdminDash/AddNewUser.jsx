import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from 'react-router-dom';
import SideNav from '../../components/SideNav';
import Navbar from '../../components/Navbar';
import { LayoutProvider } from '../../components/LayoutContext';
import Box from '@mui/material/Box';
import { useForm } from "react-hook-form";
import Typography from '@mui/material/Typography';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { firestore, auth } from "../../firebase-config";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import {
  addDoc,
  setDoc,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const drawerWidth = 240;

function AddNewUser() {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();

  const initialFormState = {
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
  };

  const [FormData, setFormData] = useState(initialFormState);

  const getBreadcrumb = () => {
    const pathParts = location.pathname.split('/admindash').filter(Boolean);
    const capitalized = pathParts.map((p) =>
      p === 'newuser' ? 'Add Employee' : p.charAt(0).toUpperCase() + p.slice(1)
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

  const {
    formState: { errors },
    getValues,
    watch,
    unregister,
    reset,
  } = useForm({
    mode: "onTouched",
  });

  // Debounce function without lodash
  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch employee data when email changes
  const fetchEmployeeData = async (email) => {
    if (!email) return;

    try {
      const employeeQuery = query(
        collection(firestore, "Employees"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(employeeQuery);

      if (!querySnapshot.empty) {
        const employeeData = querySnapshot.docs[0].data();

        setFormData(prev => ({
          ...prev, // Keep existing form data
          // Update all fields except password
          ...Object.fromEntries(
            Object.entries(employeeData)
              .filter(([key]) => key !== 'password')
          ),
          email: prev.email // Keep the current email in case user is still typing
        }));

        toast.success("Employee data loaded");
      }
    } catch (error) {
      // console.error("Error fetching employee data: ", error);
      toast.error("Failed to fetch employee data");
    }
  };

  // Debounced version of fetchEmployeeData (500ms delay)
  const debouncedFetch = useCallback(
    debounce(fetchEmployeeData, 200),
    []
  );

  // Handle email field changes
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      email: value
    }));

    if (value === "") {
      // Clear all fields except password when email is empty
      setFormData(prev => ({
        ...initialFormState,  // Reset to empty form
        password: prev.password  // Preserve any manually entered password
      }));
      return;
    }

    // Only trigger search if email has @ and . (basic validation)
    if (value.includes('@') && value.includes('.')) {
      debouncedFetch(value);
    }
  };

  // Handle other field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormData = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      skills: "",
      employmentType: "",
      jobRole: "",
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const { email, password, ...restOfFormData } = FormData; // Destructure FormData

      // Validate email is provided
      if (!email) {
        throw new Error("Email is required");
      }

      let createdUserUID;
      let isNewUser = false;
      let existingEmployeeDocRef; // To store the document reference for updates

      // First check Firestore Employee collection
      const employeeQuery = query(collection(firestore, "Employees"), where("email", "==", email));
      const employeeSnapshot = await getDocs(employeeQuery);

      if (!employeeSnapshot.empty) {
        // User exists in Employee collection
        createdUserUID = employeeSnapshot.docs[0].data().uid;
        existingEmployeeDocRef = employeeSnapshot.docs[0].ref; // Store the doc ref for update
        console.log("✅ User exists in Employee collection");
      } else {
        // Check if user exists in Auth (but not in Employee collection - edge case)
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          throw new Error("User exists in Auth but not in Employee collection");
        }

        // 🆕 New user - require password
        if (!password) {
          throw new Error("Password is required for new user");
        }

        if (password.length < 6) {
          throw new Error("Password should be at least 6 characters");
        }

        // Create new auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        createdUserUID = userCredential.user.uid;
        isNewUser = true;
        console.log("✅ New user created in Auth");
      }

      const employeeData = {
        ...restOfFormData, // Include all other form data
        uid: createdUserUID,
        updatedAt: new Date(), 
        // Only add createdAt for new users
        ...(isNewUser && { createdAt: new Date() }),
        // Only hash and include password if it's provided (for new users or password updates)
        ...(password && isNewUser && { password: await bcrypt.hash(password, 10) }),
        // If the user exists, and a password is provided, hash it for update
        ...(password && !isNewUser && { password: await bcrypt.hash(password, 10) }),
      };

      // ─── EMPLOYEE COLLECTION ────────────────────────
      if (isNewUser) {
        await setDoc(doc(firestore, "Employees", createdUserUID), employeeData);
        console.log("✅ Employee added to Employee collection");
      } else {
        await updateDoc(existingEmployeeDocRef, employeeData);
        console.log("✅ Employee updated in Employee collection");
      }

      // 📨 Send welcome email only for new users
      if (isNewUser) {
        await sendEmployeeEmail(email, password);
        toast.success("New user created successfully!");
      } else {
        toast.success("User updated successfully!");
      }

      resetFormData();

    } catch (e) {
      console.error("Error in user operation: ", e);
      toast.error(e.message || "An error occurred");
    }
  };

  const sendEmployeeEmail = async (email, password) => {
    try {
      const templateParams = {
        to_email: email,
        employee_email: email,
        employee_password: password,
      };

      const result = await emailjs.send(
        'service_tfcvgkl',
        'template_pn7itho',
        templateParams,
        'a9-tbcaGVaJ97Cd8s'
      );

      console.log("Email successfully sent!", result.status);
      toast.success("Email successfully sent!");
    } catch (error) {
      console.error("Email sending failed:", error);
      toast.error("Email sending failed!");
    }
  };

  const domain = watch("domain");

  useEffect(() => {
    if (domain !== "others") {
      unregister("otherdomainname");
    }
  }, [domain, unregister]);

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
              },
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
                Add Employee
              </Typography>

            </Box>

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
                                Fill Employee Details
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
                                  className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                  placeholder="Email"
                                  id="email"
                                  name="email"
                                  value={FormData.email}
                                  onChange={handleEmailChange}
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
                                    onChange={handleInputChange}
                                    id="Password"
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Enter password"
                                    className="form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                  />
                                  <span
                                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
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
                                  onChange={handleInputChange}
                                  className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
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
                                  onChange={handleInputChange}
                                  className="form-select w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-20 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
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
                                  <optgroup label="Testing and Quality Assurance">
                                    <option value="Tester">Tester</option>
                                    <option value="Software Test Engineer">Software Test Engineer</option>
                                    <option value="QA Engineer">QA Engineer</option>
                                    <option value="QA Analyst">QA Analyst</option>
                                    <option value="Automation Tester">Automation Tester</option>
                                    <option value="Performance Tester">Performance Tester</option>
                                  </optgroup>
                                  <optgroup label="DevOps and Cloud">
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Cloud Engineer">Cloud Engineer</option>
                                    <option value="Site Reliability Engineer">Site Reliability Engineer</option>
                                    <option value="Systems Administrator">Systems Administrator</option>
                                    <option value="Cloud Architect">Cloud Architect</option>
                                  </optgroup>
                                  <optgroup label="Data">
                                    <option value="Data Scientist">Data Scientist</option>
                                    <option value="Data Analyst">Data Analyst</option>
                                    <option value="Data Engineer">Data Engineer</option>
                                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                    <option value="Database Administrator">Database Administrator</option>
                                  </optgroup>
                                  <optgroup label="Design and User Experience">
                                    <option value="UserExperience">User Experience (UX) Designer</option>
                                    <option value="UX Researcher">UX Researcher</option>
                                    <option value="User Interface (UI) Designer">User Interface (UI) Designer</option>
                                    <option value="Web Designer">Web Designer</option>
                                    <option value="Graphic Designer">Graphic Designer</option>
                                    <option value="Product Designer">Product Designer</option>
                                  </optgroup>
                                  <optgroup label="Management and Leadership">
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="Engineering Manager">Engineering Manager</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Scrum Master">Scrum Master</option>
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
                                  onChange={handleInputChange}
                                  className={`form-control w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-slate-300 shadow-sm focus:ring focus:ring-blue-200`}
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
                              Add / Update Data
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
      </LayoutProvider>
    </>
  );
};

export default AddNewUser;