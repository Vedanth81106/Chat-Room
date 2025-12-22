import { useState } from "react";

export default function AuthForm({ onLoginSuccess }) {

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const [isLogin, setIsLogin] = useState(true); // toggle between Login and Register
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    function changeFormFields(){
        setIsLogin(!isLogin);
        setFormData({...formData, username: "", password: ""});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/auth/login" : "/auth/register";

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            //perform a check to ensure there is content to parse
            const data = await response.json().catch(() => null);

            // check if the request was successful (status 200-299)
            if (response.ok) {
                // pass teh data upto parent component - App.jsx
                // this data contains user id and token
                onLoginSuccess(data);
            } else {
                //handle Errors
                if (response.status === 403 || response.status === 401) {
                    setError("Invalid username or password!");
                } else {
                    if(data?.message){
                        //if backedn has custom message use it
                        setError(data.message);
                    } else {
                        //fallbak
                        setError("Something went wrong! Please try again!");
                    }
                }
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError("Server error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md bg-surface border border-surface-muted rounded-lg shadow-xl p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-primary mb-2">
                        {isLogin ? "Welcome Back" : "Join the Chat"}
                    </h2>
                    <p className="text-text-muted">
                        {isLogin ? "Enter your credentials to access your account" : "Create an account to start messaging"}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-background text-text-primary border border-surface-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-background text-text-primary border border-surface-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/20"
                    >
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                    </button>
                </form>

                {/* Toggle Link */}
                <div className="mt-6 text-center text-sm text-text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => changeFormFields()}
                        className="text-accent hover:text-accent-hover font-semibold hover:underline focus:outline-none"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
}