import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email tidak valid')
                .required('Email wajib diisi'),
            password: Yup.string()
                .min(6, 'Password minimal 6 karakter')
                .required('Password wajib diisi'),
            firstName: Yup.string()
                .required('Nama depan wajib diisi'),
            lastName: Yup.string()
                .required('Nama belakang wajib diisi')
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, values);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            } catch (error) {
                alert('Registrasi gagal. Silakan coba lagi.');
            }
        }
    });

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Registrasi</h2>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="firstName" className="form-label">Nama Depan</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        {...formik.getFieldProps('firstName')}
                                    />
                                    {formik.touched.firstName && formik.errors.firstName && (
                                        <div className="text-danger">{formik.errors.firstName}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lastName" className="form-label">Nama Belakang</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        {...formik.getFieldProps('lastName')}
                                    />
                                    {formik.touched.lastName && formik.errors.lastName && (
                                        <div className="text-danger">{formik.errors.lastName}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        {...formik.getFieldProps('email')}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-danger">{formik.errors.email}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        {...formik.getFieldProps('password')}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-danger">{formik.errors.password}</div>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Daftar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
