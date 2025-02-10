import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useState } from 'react';

function Create() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const passwordWatch = watch("password");
    const onSubmit = (data) => console.log(data);
    const [showPassword, setShowPassword] = useState(false)
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }
    const ProgressBar = ({password}) => {
        let num = 0;
        const pattern1 =/(?=.*[a-z])/
        const pattern2 = /(?=.*[A-Z])/
        const pattern3 =  /(?=.*[0-9])/
        const pattern4 = /(?=.*[@!_%&*])/
        const result1 = pattern1.test(password)
        const result2 = pattern2.test(password)
        const result3 = pattern3.test(password)
        const result4 = pattern4.test(password)
        if(result1 === true) {
            num = num + 25
        } if(result2 === true) {
            num = num + 25
        } if(result3 === true) {
            num = num + 25
        } if(result4 === true) {
            num = num + 25
        }
        const progressBarColor = () => {
            switch(num){
                case 0:
                    return "#FFFFFF"
                case 25:
                    return "#FF0000"
                case 50:
                    return '#ffa500'
                case 75: 
                    return '#90EE90'
                case 100: 
                    return "#00FF00"
                default:
                    return "#D3D3D3"

            }
        }
        const progressLabel = () => {
            switch(num){
                case 0:
                    return "Very weak"
                case 25:
                    return "weak"
                case 50:
                    return 'Good'
                case 75: 
                    return 'Strong'
                case 100: 
                    return "Stronger"
                default:
                    return 
            }
        }
        return (
            <>
                <div style={{
                    width: "100%",
                    maxWidth: "300px",
                    backgroundColor: "#ddd",
                    overflow: "hidden",
                    height: "7px",
                    gap: "2px"
                }}>
                    <div style={{
                        width: `${num}%`,
                        background: progressBarColor(),
                        height: "7px",
                        transition: "width 0.3s ease-in-out",
                        gap: "2px"
                    }}>
                    </div>
                </div>
                <p style={{
                    color:progressBarColor(),
                    height: "5px",
                    gap: "2px",
                    marginTop: "1px"
                }}>{progressLabel()}</p>
            </>
        )
    }
    const [password, setPassword] = useState("")

    return (
        <div>
            <h1>Account Creation Page</h1>
            <Link to="/">
                <button>Home</button>
            </Link>
            <br />
            <br />
            <form className="Registration" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" placeholder='Username' {...register("username", { required: true})}>
                </input>
                {errors.username && <span style={{ color: "red" }}>
                    *username* is mandatory</span>}
                <br />
                <div className="passwords">
                    <input type={(showPassword === false) ? "password" : "text"} placeholder='Password' {...register("password", 
                        { required: true})} onChange={e => setPassword(e.target.value)}/>
                    <span className="password-eye" onClick={handleShowPassword}>
                            {(showPassword) ? <AiFillEye /> : <AiFillEyeInvisible />}
                    </span>
                    {errors.password && <span style={{ color: "red" }}>
                        *password* is mandatory</span>}
                    <ProgressBar password={password} />
                    <input type="password" placeholder='Confirm Password' {...register("confirmPassword", { required: "Please confirm",
                        validate: value => value === passwordWatch || "passwords do not match"
                     })}/>
                    {errors.confirmPassword && <span style={{ color: "red" }}>{errors.confirmPassword.message}</span>}
                </div>
                <br />
                <br />
                <input type={"submit"} />
            </form>
        </div>
    );
}

export default Create;