import React from "react";

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

export default ProgressBar