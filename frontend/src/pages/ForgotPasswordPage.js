import React, { useState } from 'react';
import axios from 'axios'; // Você precisará ter o axios instalado: npm install axios ou yarn add axios

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email) {
            setError('Por favor, insira seu email.');
            setLoading(false);
            return;
        }

        try {
            // Adapte a URL da API conforme necessário
            const response = await axios.post('/api/v1/auth/forgot-password', { email });
            setMessage(response.data.message || 'Se um email cadastrado for encontrado, um link de redefinição será enviado.');
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Ocorreu um erro. Tente novamente.';
            setError(errorMessage);
            console.error("Erro ao solicitar redefinição de senha:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Esqueci Minha Senha</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
