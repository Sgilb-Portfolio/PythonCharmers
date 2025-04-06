import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import ProgressBar from "../components/ProgressBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Create() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const passwordWatch = watch("password");
    const [showPassword, setShowPassword] = useState(false)
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }
    const navigate = useNavigate();
    const [password, setPassword] = useState("")
    // const onSubmit = (data) => console.log(data);
    const onSubmit = async (data) => {
        try {
            //const cognitoResponse = await fetch("http://localhost:8000/api/register-cognito/", {
            const cognitoResponse = await fetch("http://44.202.51.190:8000/api/register-cognito/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                    email: data.email
                }),
            });
    
            const cognitoResult = await cognitoResponse.json();
    
            if (!cognitoResponse.ok) {
                alert(`Cognito Error: ${cognitoResult.error}`);
                return;
            }


            //const dbresponse = await fetch("http://44.202.51.190:8000/api/create-account/", {  // Update URL if needed
            const dbresponse = await fetch("http://localhost:8000/api/create-account/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                }),
            });
    
            const dbresult = await dbresponse.json();
    
            if (dbresponse.ok) {
                alert(`Account created! Your ID is ${dbresult.account_id}`);
                setTimeout(() => navigate(`/account-confirmation?username=${data.username}`), 1000); //redirect to confirmation after success
            } else {
                alert(`Error: ${dbresult.error}`);
            }
        } catch (error) {
            console.error("Error creating account:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />
            
            <main style={{ 
                flex: "1", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                padding: "40px 20px" 
            }}>
                <h1 style={{ fontSize: "48px", color: "#333333", marginBottom: "20px" }}>Account Creation Page</h1>

                <div style={{
                    backgroundColor: "#FFFFFF",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    width: "400px",
                    textAlign: "center",
                    marginBottom: "30px"
                }}>
                    <form className="Registration" onSubmit={handleSubmit(onSubmit)}>
                        <input type="text" placeholder='Username' {...register("username", { required: true })}
                            style={{
                                width: "95%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "5px",
                                border: "1px solid #333333"
                            }}>
                        </input>
                        {errors.username && <span style={{ color: "red", display: "block" }}>
                            *username* is mandatory</span>}
                        <br />

                        <input type="email" placeholder='Email' {...register("email", { required: true })}
                            style={{
                                width: "95%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "5px",
                                border: "1px solid #333333"
                            }}>
                        </input>
                        {errors.email && <span style={{ color: "red", display: "block" }}>
                            *email* is mandatory</span>}
                        <br />

                        <div className="passwords" 
                            style={{
                            position: "relative"
                            }}>
                            <input type={(showPassword === false) ? "password" : "text"} placeholder='Password' {...register("password", 
                                { required: true})} onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: "95%", 
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #333333"}}/>
                            <span className="password-eye" onClick={handleShowPassword}
                                style={{
                                    position: "absolute", 
                                    right: "10px", 
                                    top: "20px", 
                                    cursor: "pointer"}}>
                                    {(showPassword) ? <AiFillEye /> : <AiFillEyeInvisible />}
                                </span>
                                {errors.password && <span style={{ color: "red", display: "block" }}>
                                    *password* is mandatory</span>}
                                <div
                                    style={{
                                        width: "100%",
                                    }}>
                                    <ProgressBar password={password} />
                                </div>
                                <input type="password" placeholder='Confirm Password' {...register("confirmPassword", {
                                    required: "Please confirm",
                                    validate: value => value === passwordWatch || "passwords do not match"
                                })}
                                    style={{
                                        width: "95%",
                                        padding: "10px",
                                        marginBottom: "10px",
                                        borderRadius: "5px",
                                        border: "1px solid #333333"
                                    }} />
                                {errors.confirmPassword && <span style={{ color: "red", display: "block" }}>{errors.confirmPassword.message}</span>}
                            </div>
                            <br />
                            <br />

                            <input type="submit" value="Create Account"
                                style={{
                                    width: "100%",
                                    backgroundColor: "#f56600",
                                    color: "#FFFFFF",
                                    border: "none",
                                    padding: "10px",
                                    fontSize: "18px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"} />
                    </form>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default Create;