import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import admin from "../assets/admin.jpg";
import employee from "../assets/employee.jpg";
import employeeDesk from "../assets/EmployeeDesk.png";
import ems from "../assets/EMS.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { auth, firestore } from "../firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
    const [isAdmin, setIsAdmin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Navigate = useNavigate();
    const historyRef = useNavigate();

    const handleAdminLogin = async (event) => {

        setError(null);
        event.preventDefault();
        setError("");
        if (!email || !password) {
            toast.error("All fields are required!");
            return;
        } else {
            setLoading(true);
        }

        try {
            // console.log(email);
            const q = query(
                collection(firestore, "Admin"),
                where("email", "==", email)
            );

            console.log("Checking user in Admin collection");
            const querySnapshot = await getDocs(q);
            // console.log("Query snapshot:", querySnapshot);

            if (querySnapshot.empty) {
                toast.error("Admin doesn't exist or not an admin");
                setEmail("");
                setPassword("");
                setLoading(false);
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredentials) => {
                        const user = userCredentials.user;
                        // console.log("Signed in user:", user);
                        toast.success("Signing In");
                        Navigate("/admindash");
                    })
                    .catch((e) => {
                        toast.error(e.code);
                        if (e.code === "auth/invalid-credentials")
                            setError("Incorrect password!");
                        if (e.code === "auth/too-many-requests")
                            setError("Access to this account has been temporarily disabled due to many failed login attempts.");
                        setEmail("");
                        setPassword("");
                        setLoading(false);
                    });
            }

        } catch (error) {
            toast.error("Error checking user existence:", error);
            setEmail("");
            setPassword("");
            setLoading(false);
        }
    };

    const handleEmployeeLogin = async (event) => {

        setError(null);
        event.preventDefault();
        setError("");

        if (!email || !password) {
            toast.error("All fields are required!");
            return;
        } else {
            setLoading(true);
        }

        try {
            // console.log(email);
            const q = query(
                collection(firestore, "Employees"),
                where("email", "==", email)
            );

            console.log("Checking user in Employees collection");
            const querySnapshot = await getDocs(q);
            // console.log("Query snapshot:", querySnapshot);

            if (querySnapshot.empty) {
                toast.error("Employee doesn't exist or not an employee");
                setEmail(""); // Clear email field
                setPassword(""); // Clear password field
                setLoading(false);
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredentials) => {
                        const user = userCredentials.user;
                        // console.log("Signed in user:", user);
                        toast.success("Logging In");
                        Navigate("/employeedash");
                    })
                    .catch((e) => {
                        console.error("Login error:", e.code);
                        toast.error(e.code);

                        if (e.code === "auth/invalid-credentials") {
                            setError("Incorrect password!");
                        }
                        if (e.code === "auth/too-many-requests") {
                            setError("Access to this account has been temporarily disabled due to many failed login attempts.");
                        }

                        setEmail(""); // Clear email field
                        setPassword(""); // Clear password field
                        setLoading(false);
                    });
            }

        } catch (error) {
            console.error("Error checking user existence:", error);
            toast.error("Something went wrong while checking user.");
            setEmail(""); // Clear email field
            setPassword(""); // Clear password field
            setLoading(false);
        }
    };


    const sendPasswordReset = async (email) => {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset link sent! Check your email.");
        } catch (error) {
            console.error("Failed to send password reseet link:", error);
            toast.error("Failed to send password reset link. Please try again.");
        }
        setLoading(true);
    };

    useEffect(() => {
        console.log(auth.currentUser);
        if (auth.currentUser) {
            historyRef("/");
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-65 from-white-100 to-pink-100">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                {/* Image Section */}
                <div className="relative hidden md:block">
                    <img
                        // src={isAdmin ? admin : employee}
                        src={ employeeDesk }
                        alt="Background"
                        className="w-[400px] h-full rounded-2xl object-fit"
                    />
                </div>

                {/* Login Form */}
                <form
                    onSubmit={isAdmin ? handleAdminLogin : handleEmployeeLogin}
                    className="flex flex-col justify-center p-8 md:p-14"
                >
                    <span className="mb-3 text-4xl font-bold">
                        {isAdmin ? "Admin Login" : "Employee Login"}
                    </span>

                    <div className="py-4">
                        <span className="mb-2 text-md">Email</span>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            id="email"
                            placeholder="Enter email"
                            className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                        />
                    </div>

                    <div className="py-4">
                        <span className="mb-2 text-md">Password</span>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                name="pass"
                                id="pass"
                                placeholder="Enter password"
                                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between w-full py-4">
                        <div className="mr-24">
                            <input type="checkbox" id="remember" className="mr-2" />
                            <label htmlFor="remember" className="text-md">
                                Remember password
                            </label>
                        </div>
                        <a
                            href="/"
                            className="font-bold text-md cursor-pointer hover:underline"
                            onClick={(e) => {
                                e.preventDefault();
                                sendPasswordReset(email);
                            }}
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-gray-300 hover:text-black hover:border-gray-300"
                        type="submit"
                        id="loginButton"
                    >
                        Sign in
                    </button>

                    <div className="text-center text-gray-500">
                        {isAdmin ? "Not an admin?" : "Not an Employee?"}{" "}
                        <span
                            className="font-bold text-black cursor-pointer hover:underline"
                            onClick={() => setIsAdmin(!isAdmin)}
                        >
                            {isAdmin ? "Employee Login" : "Admin Login"}
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
