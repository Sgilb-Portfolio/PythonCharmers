import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useState } from 'react';
import ProgressBar from "../components/ProgressBar";

function Create() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const passwordWatch = watch("password");
    const onSubmit = (data) => console.log(data);
    const [showPassword, setShowPassword] = useState(false)
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
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