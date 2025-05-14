import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom'; // Para pegar o token da URL e para navegação (v5)
// Certifique-se de ter react-router-dom instalado: npm install react-router-dom ou yarn add react-router-dom
import axios from 'axios';

const ResetPasswordPage = () => {
    const { token } = useParams(); // Pega o token da URL
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de redefinição não fornecido ou inválido.');
            // Opcionalmente, redirecionar para a página de login ou forgot-password
            // history.push('/login');
        }
    }, [token, history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!password || !confirmPassword) {
            setError('Por favor, preencha ambos os campos de senha.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 8) { // Consistente com o backend
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        setLoading(true);
        try {
            // Adapte a URL da API conforme necessário
            const response = await axios.post(`/api/v1/auth/reset-password/${token}`, { senha: password });
            setMessage(response.data.message || 'Sua senha foi redefinida com sucesso!');
            // Opcional: redirecionar para a página de login após um breve delay
            setTimeout(() => {
                history.push('/login'); // Ajuste a rota de login conforme sua configuração
            }, 3000);
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Ocorreu um erro ao redefinir sua senha. O token pode ser inválido ou ter expirado.';
            setError(errorMessage);
            console.error("Erro ao redefinir senha:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Token Inválido</h2>
                <p>{error || 'O link de redefinição de senha é inválido ou expirou.'}</p>
                {/* Você pode adicionar um link para a página de 'esqueci minha senha' aqui */}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Nova Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="8"
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength="8"
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
