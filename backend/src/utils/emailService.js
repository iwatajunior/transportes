const nodemailer = require('nodemailer');

// Configuração do transporter do nodemailer para Office 365
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 10000,  // 10 segundos
    socketTimeout: 10000,    // 10 segundos
    debug: true, // Habilita logs detalhados
    logger: true // Habilita logs do nodemailer
});

// Função para enviar email de redefinição de senha
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Redefinição de Senha - Sistema de Rotas e Viagens',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1976d2;">Redefinição de Senha</h2>
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir sua senha no Sistema de Rotas e Viagens.</p>
                <p>Para redefinir sua senha, clique no link abaixo:</p>
                <p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; 
                              padding: 10px 20px; 
                              background-color: #1976d2; 
                              color: white; 
                              text-decoration: none; 
                              border-radius: 5px;">
                        Redefinir Senha
                    </a>
                </p>
                <p>Se você não solicitou a redefinição de senha, por favor ignore este email.</p>
                <p>Este link é válido por 1 hora.</p>
                <p>Atenciosamente,<br>CSI - Coord. de Sistemas de Informação</p>
            </div>
        `
    };

    try {
        console.log('Tentando enviar email para:', email);
        console.log('Configurações SMTP:', {
            host: transporter.options.host,
            port: transporter.options.port,
            user: transporter.options.auth.user,
            from: mailOptions.from
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email de redefinição de senha enviado com sucesso:', info);
        return true;
    } catch (error) {
        console.error('Erro detalhado ao enviar email:', {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail
}; 