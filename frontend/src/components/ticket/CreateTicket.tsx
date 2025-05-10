import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTicket = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            priority: 'medium'
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .required('Judul wajib diisi'),
            description: Yup.string()
                .required('Deskripsi wajib diisi'),
            priority: Yup.string()
                .oneOf(['low', 'medium', 'high'], 'Prioritas tidak valid')
                .required('Prioritas wajib diisi')
        }),
        onSubmit: async (values) => {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.REACT_APP_API_URL}/tickets`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/tickets');
            } catch (error) {
                alert('Gagal membuat tiket. Silakan coba lagi.');
            }
        }
    });

    return (
        <div className="container mt-4">
            <h2>Buat Tiket Baru</h2>
            <div className="card">
                <div className="card-body">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Judul</label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                {...formik.getFieldProps('title')}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <div className="text-danger">{formik.errors.title}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Deskripsi</label>
                            <textarea
                                className="form-control"
                                id="description"
                                rows={4}
                                {...formik.getFieldProps('description')}
                            />
                            {formik.touched.description && formik.errors.description && (
                                <div className="text-danger">{formik.errors.description}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="priority" className="form-label">Prioritas</label>
                            <select
                                className="form-control"
                                id="priority"
                                {...formik.getFieldProps('priority')}
                            >
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                            {formik.touched.priority && formik.errors.priority && (
                                <div className="text-danger">{formik.errors.priority}</div>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Buat Tiket
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;
