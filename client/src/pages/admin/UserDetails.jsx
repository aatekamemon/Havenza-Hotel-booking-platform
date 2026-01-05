import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import adminApi from '../../utils/adminApi'

const UserDetails = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', role: 'user' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminApi.get(`/users/${id}`)
        setUser(data)
        setForm({ username: data.username || '', email: data.email || '', role: data.role || 'user' })
      } catch (err) {
        setError('Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSave = async () => {
    try {
      setSaving(true)
      const { data } = await adminApi.put(`/users/${id}`, form)
      setUser(data)
    } catch (err) {
      setError('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className='p-6 max-w-xl bg-white border rounded shadow'>
      <h1 className='text-2xl font-bold mb-4'>User Details</h1>
      <div className='space-y-3'>
        <div>
          <label className='block text-gray-600 mb-1'>Username</label>
          <input name='username' value={form.username} onChange={onChange} className='w-full border px-3 py-2 rounded' />
        </div>
        <div>
          <label className='block text-gray-600 mb-1'>Email</label>
          <input name='email' value={form.email} onChange={onChange} className='w-full border px-3 py-2 rounded' />
        </div>
        <div>
          <label className='block text-gray-600 mb-1'>Role</label>
          <select name='role' value={form.role} onChange={onChange} className='w-full border px-3 py-2 rounded'>
            <option value='user'>user</option>
            <option value='hotelOwner'>hotelOwner</option>
          </select>
        </div>
        <button onClick={onSave} disabled={saving} className='px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-70'>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

export default UserDetails


