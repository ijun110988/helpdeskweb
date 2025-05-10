import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email tidak valid')
                .required('Email harus diisi'),
            password: Yup.string()
                .required('Password harus diisi')
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, values);
                console.log('Login response:', response.data);
                
                const { token, user } = response.data;
                if (!token || !user) {
                    throw new Error('Data login tidak valid');
                }

                console.log('User role:', user.role);
                login(token, user);

                // Redirect berdasarkan role
                if (user.role === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate('/tickets');
                }
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Terjadi kesalahan saat login';
                
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        errorMessage = 'Email atau password salah';
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    }
                }
                
                formik.setErrors({ email: errorMessage });
            }
        }
    });

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-4">
                    <h4 className="text-center mb-4">Login Help Desk</h4>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                id="email"
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="invalid-feedback">{formik.errors.email}</div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                id="password"
                                {...formik.getFieldProps('password')}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="invalid-feedback">{formik.errors.password}</div>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Memproses...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
