import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const TicketCreate = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            priority: 'low'
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .required('Judul tiket wajib diisi')
                .min(5, 'Judul minimal 5 karakter'),
            description: Yup.string()
                .required('Deskripsi wajib diisi')
                .min(10, 'Deskripsi minimal 10 karakter'),
            priority: Yup.string()
                .required('Prioritas wajib dipilih')
                .oneOf(['low', 'medium', 'high'], 'Prioritas tidak valid')
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.REACT_APP_API_URL}/tickets`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/tickets');
            } catch (err) {
                setError('Gagal membuat tiket. Silakan coba lagi.');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Buat Tiket Baru</h2>
                            
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Judul Tiket</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                                        id="title"
                                        {...formik.getFieldProps('title')}
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="invalid-feedback">{formik.errors.title}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Deskripsi</label>
                                    <textarea
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        id="description"
                                        rows={5}
                                        {...formik.getFieldProps('description')}
                                    />
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback">{formik.errors.description}</div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="priority" className="form-label">Prioritas</label>
                                    <select
                                        className={`form-select ${formik.touched.priority && formik.errors.priority ? 'is-invalid' : ''}`}
                                        id="priority"
                                        {...formik.getFieldProps('priority')}
                                    >
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                    </select>
                                    {formik.touched.priority && formik.errors.priority && (
                                        <div className="invalid-feedback">{formik.errors.priority}</div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/tickets')}
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Menyimpan...
                                            </>
                                        ) : 'Buat Tiket'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCreate;
