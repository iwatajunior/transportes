import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Avatar
} from '@mui/material';

const USER_ROLES_OPTIONS = [
    { value: 'requisitante', label: 'Requisitante' },
    { value: 'aprovador', label: 'Aprovador' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'motorista', label: 'Motorista' }
];

const UserForm = ({ onSubmit, isEditMode = false, initialData = {} }) => {
    const fileInputRef = useRef(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        nome: initialData.nome || '',
        email: initialData.email || '',
        senha: '',
        confirmarSenha: '',
        perfil: initialData.perfil || 'requisitante',
        setor: initialData.setor || '',
        fotoUrl: initialData.fotoUrl || ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log('[UserForm] useEffect - Dados iniciais recebidos:', initialData);
            setFormData(prevData => ({
                ...prevData,
                nome: initialData.nome || '',
                email: initialData.email || '',
                perfil: initialData.perfil || USER_ROLES_OPTIONS[0]?.value || '',
                setor: initialData.setor || '',
                fotoUrl: initialData.fotoUrl || ''
            }));
        }

        if (initialData?.fotoUrl) {
            console.log('[UserForm] useEffect - initialData.fotoUrl:', initialData.fotoUrl);
            if (initialData.fotoUrl.startsWith('http') || initialData.fotoUrl.startsWith('blob:')) {
                setImagePreviewUrl(initialData.fotoUrl);
                console.log('[UserForm] useEffect - imagePreviewUrl set to (already complete):', initialData.fotoUrl);
            } else {
                const backendUrl = process.env.REACT_APP_API_URL || 'http://10.1.1.42:3001';
                console.log('[UserForm] useEffect - backendUrl:', backendUrl);
                const fullUrl = `${backendUrl}${initialData.fotoUrl}`;
                setImagePreviewUrl(fullUrl);
                console.log('[UserForm] useEffect - imagePreviewUrl set to (prefixed):', fullUrl);
            }
        } else {
            console.log('[UserForm] useEffect - initialData.fotoUrl é nulo ou vazio.');
        }
    }, [initialData]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setImagePreviewUrl(null);
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setFormErrors(prev => ({
                ...prev,
                foto: 'Formato de arquivo inválido. Use JPEG, PNG ou GIF.'
            }));
            setSelectedFile(null);
            setImagePreviewUrl(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFormErrors(prev => ({
                ...prev,
                foto: 'Arquivo muito grande. Máximo de 5MB permitido.'
            }));
            setSelectedFile(null);
            setImagePreviewUrl(null);
            return;
        }

        setFormErrors(prev => ({ ...prev, foto: '' }));
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
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
        if (!formData.nome || formData.nome.trim() === '') {
            errors.nome = 'Nome é obrigatório';
        }
        if (!formData.email || formData.email.trim() === '') {
            errors.email = 'Email é obrigatório';
        }
        if (!isEditMode && (!formData.senha || formData.senha.trim() === '')) {
            errors.senha = 'Senha é obrigatória';
        }
        if (!formData.perfil || formData.perfil.trim() === '') {
            errors.perfil = 'Perfil é obrigatório';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                nome: formData.nome.trim(),
                email: formData.email.trim(),
                senha: formData.senha,
                perfil: formData.perfil
            };

            if (formData.setor && formData.setor.trim()) {
                submitData.setor = formData.setor.trim();
            }

            // Se houver foto, criar FormData e adicionar todos os campos
            if (selectedFile) {
                const formDataWithFile = new FormData();
                
                // Primeiro adiciona os dados do usuário
                Object.entries(submitData).forEach(([key, value]) => {
                    formDataWithFile.append(key, value);
                });

                // Depois adiciona a foto
                formDataWithFile.append('foto', selectedFile);

                // Log dos dados que serão enviados
                const formDataEntries = Array.from(formDataWithFile.entries());
                console.log('Dados do formulário (FormData):', {
                    ...submitData,
                    foto: selectedFile.name,
                    entries: formDataEntries.map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`)
                });

                onSubmit(formDataWithFile);
            } else {
                console.log('Dados do formulário (JSON):', submitData);
                onSubmit(submitData);
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                        src={imagePreviewUrl || undefined}
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
                        <Button variant="outlined" component="span">
                            {imagePreviewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                        </Button>
                    </label>
                    {formErrors.foto && <FormHelperText error sx={{textAlign: 'center'}}>{formErrors.foto}</FormHelperText>}
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="nome"
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        error={!!formErrors.nome}
                        helperText={formErrors.nome || ''}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email"
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
                        required={!isEditMode}
                        fullWidth
                        name="senha"
                        label={isEditMode ? "Nova Senha" : "Senha"}
                        type="password"
                        id="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        error={!!formErrors.senha}
                        helperText={formErrors.senha || ''}
                        autoComplete="new-password"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required={!isEditMode}
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
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!formErrors.perfil}>
                        <InputLabel id="perfil-label">Perfil</InputLabel>
                        <Select
                            labelId="perfil-label"
                            id="perfil"
                            name="perfil"
                            value={formData.perfil}
                            onChange={handleChange}
                            label="Perfil"
                        >
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
                        label="Setor"
                        name="setor"
                        value={formData.setor}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                >
                    {isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
            </Box>
        </Box>
    );
};

export default UserForm;
