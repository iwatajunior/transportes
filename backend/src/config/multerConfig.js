const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar o diretório de uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
console.log('DEBUG - Configurando multer para salvar em:', uploadDir);

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer usando memoryStorage
const storage = multer.memoryStorage();

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    // Aceitar apenas imagens
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas JPG, JPEG e PNG são permitidos.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;
