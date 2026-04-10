import React, { useState } from 'react';

const Profile = () => {
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if(passwordData.new !== passwordData.confirm) {
      alert("Las contraseña nueva no coincide");
      return;
    }

    try {
      // Obtenemos el token de la sesión actual
      const token = localStorage.getItem('auth_token'); 

      const response = await fetch('http://127.0.0.1:8000/api/perfil/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          current: passwordData.current,
          new: passwordData.new
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ " + data.message);
        setPasswordData({ current: '', new: '', confirm: '' }); // Limpia campos
      } else {
        alert("Error: " + data.message);
      }

    } catch (error) {
      alert("Ocurrió un problema de conexión con el servidor.");
      console.error(error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#00d4ff' }}>Configuración de Perfil</h2>
      
      <div style={cardStyle}>
        <h3>Información Personal</h3>
        <p><strong>Usuario:</strong> {localStorage.getItem('user_name') || 'Aomar Alexc'}</p>
        <p><strong>Email:</strong> {localStorage.getItem('user_email') || 'alexc@gestix.com'}</p>
      </div>

      <div style={cardStyle}>
        <h3>Seguridad y Contraseña</h3>
        <form onSubmit={handleUpdate}>
          <label style={labelStyle}>Contraseña Actual</label>
          <input 
            type="password" 
            style={inputStyle} 
            value={passwordData.current}
            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
          />
          
          <label style={labelStyle}>Nueva Contraseña</label>
          <input 
            type="password" 
            style={inputStyle} 
            value={passwordData.new}
            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
          />
          
          <label style={labelStyle}>Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            style={inputStyle} 
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
          />
          
          <button type="submit" style={buttonStyle}>Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};




const containerStyle = { padding: '40px', backgroundColor: '#0b0e14', minHeight: '100vh', color: 'white' };
const cardStyle = { background: '#1c222d', padding: '20px', borderRadius: '12px', marginBottom: '20px', maxWidth: '450px', border: '1px solid #2d3748' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#a0aec0' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #2d3748', backgroundColor: '#0b0e14', color: 'white' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

export default Profile;