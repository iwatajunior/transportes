import React, { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Box,
    CircularProgress,
    Typography,
    FormHelperText,
    Avatar,
    Button as MuiButton // Renomeando para evitar conflito se houver outro Button
} from '@mui/material';

const USER_ROLES_OPTIONS = [
    { value: 'requisitante', label: 'Requisitante' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'motorista', label: 'Motorista' }
];

const UserForm = ({ onSubmit, isLoading, initialData = {}, isEditMode = false }) => {
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        perfil: USER_ROLES_OPTIONS[0]?.value || '',
        setor: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const defaultData = {
            nome: '',
            email: '',
            senha: '',
            confirmarSenha: '',
            perfil: USER_ROLES_OPTIONS[0]?.value || '',
            setor: '',
            fotoUrl: '', // Adicionar fotoUrl aos dados default
            ...initialData
        };

        if (initialData && initialData.fotoUrl) {
            console.log('[UserForm] useEffect - initialData.fotoUrl:', initialData.fotoUrl);
            // Se fotoUrl já for uma URL completa (ex: de um preview local ou já corrigida), não prefixar
            if (initialData.fotoUrl.startsWith('http') || initialData.fotoUrl.startsWith('blob:')) {
                setImagePreviewUrl(initialData.fotoUrl);
                console.log('[UserForm] useEffect - imagePreviewUrl set to (already complete):', initialData.fotoUrl);
            } else {
                const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                console.log('[UserForm] useEffect - backendUrl:', backendUrl);
                const fullUrl = `${backendUrl}${initialData.fotoUrl}`;
                setImagePreviewUrl(fullUrl);
                console.log('[UserForm] useEffect - imagePreviewUrl set to (prefixed):', fullUrl);
            }
        } else if (initialData) {
            console.log('[UserForm] useEffect - initialData.fotoUrl é nulo ou vazio.');
        }

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log('[UserForm] useEffect - Dados iniciais recebidos:', initialData);
            const newFormData = {
                ...defaultData,
                senha: '', // Limpar campo de senha ao carregar para edição
                confirmarSenha: ''
            };
            console.log('[UserForm] useEffect - Novo formData:', newFormData);
            setFormData(newFormData);
        } else {
            setFormData(defaultData);
        }
    }, [JSON.stringify(initialData), isEditMode]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            if (formErrors.foto) { // Limpar erro da foto se houver
                setFormErrors(prevErrors => ({ ...prevErrors, foto: null }));
            }
        } else {
            // Se nenhum arquivo for selecionado (ex: usuário cancelou),
            // reverter para a imagem original (se houver) ou limpar
            setSelectedFile(null);
            // Reverter para a imagem original, se houver, prefixando-a
            if (initialData?.fotoUrl) {
                if (initialData.fotoUrl.startsWith('http') || initialData.fotoUrl.startsWith('blob:')) {
                    setImagePreviewUrl(initialData.fotoUrl);
                } else {
                    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                    setImagePreviewUrl(`${backendUrl}${initialData.fotoUrl}`);
                }
            } else {
                setImagePreviewUrl(null);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nome.trim()) errors.nome = "Nome é obrigatório.";
        if (!formData.email.trim()) errors.email = "Email é obrigatório.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email inválido.";

        // Validar senha apenas se não for modo de edição OU se o campo senha tiver sido preenchido
        if (!isEditMode || (isEditMode && formData.senha)) {
            if (!formData.senha) errors.senha = "Senha é obrigatória.";
            else if (formData.senha.length < 6) errors.senha = "Senha deve ter no mínimo 6 caracteres.";
            if (formData.senha !== formData.confirmarSenha) errors.confirmarSenha = "As senhas não coincidem.";
        } else if (isEditMode && formData.confirmarSenha && !formData.senha) {
            // Se estiver editando, a nova senha não foi preenchida, mas a confirmação foi
            errors.senha = "Para definir uma nova senha, preencha o campo 'Nova Senha'.";
        }
        
        if (!formData.perfil) errors.perfil = "Perfil é obrigatório.";
        // Validação para setor é opcional, então não adicionamos aqui a menos que seja requisito.

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = new FormData();

            // Nomes dos campos como o backend espera (em português)
            const fieldNamesBackend = {
                nome: 'nome',
                email: 'email',
                senha: 'senha',
                perfil: 'perfil',
                setor: 'setor',
                ativo: 'ativo'
            };

            // Lógica restaurada e refinada para construir FormData
            if (selectedFile) {
                dataToSubmit.append('foto', selectedFile);
                console.log('[UserForm] Imagem selecionada, adicionando campo \'foto\'.');
            }

            console.log('[UserForm] Adicionando campos de texto ao FormData.');
            Object.keys(formData).forEach(key => {
                const backendFieldName = fieldNamesBackend[key];
                if (backendFieldName) {
                    let value = formData[key];

                    if (backendFieldName === 'senha') {
                        if (value) { // Só envia senha se tiver algum valor
                            dataToSubmit.append(backendFieldName, String(value));
                        } else {
                            // Não envia o campo senha se estiver vazio (para não sobrescrever)
                            console.log(`[UserForm] Campo '${backendFieldName}' vazio, não será enviado.`);
                        }
                        return; // Continua para o próximo campo
                    }

                    if (backendFieldName === 'ativo') {
                        // Envia 'ativo' como string 'true' ou 'false'
                        // Se value for undefined (checkbox não marcado e sem valor inicial), trata como false para envio
                        const ativoValue = (typeof value === 'boolean' ? value : (String(value).toLowerCase() === 'true')) || false;
                        dataToSubmit.append(backendFieldName, String(ativoValue));
                        console.log(`[UserForm] Campo '${backendFieldName}' adicionado como: ${String(ativoValue)}`);
                        return; // Continua para o próximo campo
                    }
                    
                    // Para outros campos (nome, email, perfil, setor)
                    if (value !== null && typeof value !== 'undefined') {
                        dataToSubmit.append(backendFieldName, String(value));
                        console.log(`[UserForm] Campo '${backendFieldName}' adicionado como: ${String(value)}`);
                    } else if (value === null || typeof value === 'undefined') {
                         console.log(`[UserForm] Campo '${backendFieldName}' é null ou undefined, não será enviado.`);
                         // Não envia campos null ou undefined, a menos que seja uma string vazia intencional para limpar (ex: setor)
                    }
                }
            });
            
            // Log FormData entries for debugging
            console.log("[UserForm] FormData entries before submit:");
            for (let [key, value] of dataToSubmit.entries()) {
                console.log(`[UserForm] FormData: ${key} =`, value);
            }

            onSubmit(dataToSubmit);
        } else {
            console.log("Erros de validação no formulário de usuário:", formErrors);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                        src={imagePreviewUrl || undefined} // Se for null, Avatar mostra ícone padrão
                        alt="Foto do Perfil" 
                        sx={{ width: 100, height: 100, mb: 1 }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        id="foto-upload"
                    />
                    <label htmlFor="foto-upload">
                        <MuiButton variant="outlined" component="span" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                            {imagePreviewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                        </MuiButton>
                    </label>
                    {formErrors.foto && <FormHelperText error sx={{textAlign: 'center'}}>{formErrors.foto}</FormHelperText>}
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        id="nome"
                        label="Nome Completo"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        error={!!formErrors.nome}
                        helperText={formErrors.nome || ''}
                        autoFocus={!isEditMode} // Foca no primeiro campo em modo de criação
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        id="email"
                        label="Endereço de Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required={!isEditMode} // Senha é obrigatória apenas na criação
                        fullWidth
                        name="senha"
                        label={isEditMode ? "Nova Senha" : "Senha"}
                        type="password"
                        id="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        error={!!formErrors.senha}
                        helperText={formErrors.senha || (isEditMode ? "Deixe em branco para não alterar" : '')}
                        autoComplete="new-password"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required={!isEditMode || !!formData.senha} // Confirmar Senha é obrigatório se nova senha for digitada
                        fullWidth
                        name="confirmarSenha"
                        label={isEditMode ? "Confirmar Nova Senha" : "Confirmar Senha"}
                        type="password"
                        id="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        error={!!formErrors.confirmarSenha}
                        helperText={formErrors.confirmarSenha || ''}
                        autoComplete="new-password"
                        disabled={isEditMode && !formData.senha} // Desabilitar se nova senha não estiver sendo digitada
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!formErrors.perfil}>
                        <InputLabel id="perfil-label">Perfil</InputLabel>
                        <Select
                            labelId="perfil-label"
                            id="perfil"
                            name="perfil"
                            value={formData.perfil || ''}
                            onChange={handleChange}
                            label="Perfil"
                            error={!!formErrors.perfil}
                            sx={{ minWidth: 120 }}
                        >
                            {console.log('[UserForm] Valor atual do perfil:', formData.perfil)}
                            {USER_ROLES_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.perfil && <FormHelperText>{formErrors.perfil}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="setor"
                        label="Setor (Opcional)"
                        name="setor"
                        value={formData.setor}
                        onChange={handleChange}
                        error={!!formErrors.setor} // Embora não obrigatório, pode ter validação de formato no futuro
                        helperText={formErrors.setor || ''}
                    />
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontFamily: "'Exo 2', sans-serif" }}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Salvar Alterações' : 'Criar Usuário')}
            </Button>
        </Box>
    );
};

export default UserForm;
