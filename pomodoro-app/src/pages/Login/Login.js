import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { UserContext } from '../../App';

const apiUrl = config.apiUrl;

const Login = () => {
    console.log(apiUrl);
    const { xCorrId } = useContext(UserContext)
    const navigate = useNavigate();

    const [status, setStatus] = useState(null);
    const [userLogin, setUserLogin] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setUserLogin({
            ...userLogin,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const cid = xCorrId || `pomo-${Math.ceil(Math.random()*1000)}`;
        console.log(`${apiUrl}/user/login`)
        axios.post(`${apiUrl}/user/login`, userLogin, {
            headers: {
                'x-correlation-id': cid
            }
        })
        .then(res => {
            axios.post(`${apiUrl}/user/verifyUser`, res.data, {
                headers: {
                    'x-correlation-id': cid,
                    'x-access-token': res.data.token
                }
            })
            .then(res => {
                setStatus(res.data)
                sessionStorage.setItem('userInfo', JSON.stringify(res.data))
                navigate('/')
            })
            .catch(err => {
                console.log(err);
                if (err.response && err.response.status === 403) {
                    setStatus({ message: err.response.data.message });
                } else {
                    setStatus({ message: 'Verification failed' });
                }
            });
        })
        .catch(err => {
            // console.log(err.response)
            if(err.response && err.response.status === 401) {
                setStatus({message: err.response.data.message})
            } else if(err.response && err.response.status === 402) {
                setStatus({message: err.response.data.message})
            } else if(err.code === 'ERR_NETWORK') {
                setStatus(err.message);
            } else if(err.code === 'ERR_BAD_REQUEST') {
                setStatus({message: 'Server is not online'})
            }
        })
        setUserLogin({
            email: '',
            password: ''
        });
    }

    const inlineStyle = {
        borderRadius: '10px',
        padding: '5px'
    }


    return (
        <main className='main-container text-center'>
            <div className="form-container mx-auto pt-5">
                <div className='form-wrapper mx-auto border border-outline-secondary p-2 bg-light'>
                    <h3 className='m-3'>LOGIN FORM</h3>
                    {status ? 
                        <p style={inlineStyle} className={status.success ? 'text-success' : 'text-danger'}>
                            {status.message ? status.message : status}</p> 
                    : null
                    }

                    <form onSubmit={handleSubmit}>
                        <div className='w-75 mx-auto'>
                            <input
                                type='email'
                                name='email'
                                value={userLogin.email}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your email'
                                required
                            />
                            <input
                                type='password'
                                name='password'
                                value={userLogin.password}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your password'
                                required
                            />
                            <button className='btn btn-primary w-100'>Continue</button>
                        </div>
                    </form>
                    
                    <p className='m-3'>Can't Login ? <Link to='/signup'>Create Account</Link></p>
                    <hr className='w-50 mx-auto' />
                    <div>
                        <h4 className='mb-3 text-danger fw-bold'>Pomodoro</h4>
                        <p className='small'>Privacy Policy <span>.</span> User Notice</p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login