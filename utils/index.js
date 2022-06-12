module.exports.getErrors = function (body) {
    const { license, category, day, month, year, captcha } = body;
    let errors = {};
    if (!license) {
        errors = { license: 'Ce champ est obligatoire' };
    } else if (license && license.toString().length !== 12) {
        errors = { ...errors, license: 'Code de vérification incorrect au format 000000000000' }
    }

    if (!day || !month || !year) {
        errors = { ...errors, birthDate: 'Veuillez remplir ce champ au format JJ/MM/AAAA' }
    }
    if (!captcha) {
        errors = { ...errors, captcha: 'Ce champ est obligatoire' };
    }

    if (!category || category && category === 'placeholder') {
        errors = { ...errors, category: 'Veuillez sélectionner une catégorie' }
    }
    return errors;
}