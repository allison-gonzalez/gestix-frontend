import { useState } from 'react';
import { profileService } from '../services';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user, updateUser } = useAuth();

  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');

  const [updating, setUpdating]             = useState(false);
  const [profileError, setProfileError]     = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const updatePassword = async (current, newPassword) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await profileService.updatePassword({ current, new: newPassword });
      setSuccess(res.data?.message || 'Contraseña actualizada correctamente');
      updateUser({ must_change_password: false });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data) => {
    setProfileError('');
    setProfileSuccess('');
    setUpdating(true);
    try {
      const res = await profileService.updateProfile(data);
      setProfileSuccess(res.data?.message || 'Perfil actualizado');
      if (res.data?.user) updateUser(res.data.user);
      return true;
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error al actualizar el perfil');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    user,
    loading, error, success, updatePassword,
    updating, profileError, profileSuccess, updateProfileData,
  };
}
