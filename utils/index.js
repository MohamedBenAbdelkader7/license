module.exports.getErrors = function (body) {
    const { license, category, day, month, year } = body;
    let errors = {};
    if (!license) {
        errors = { license: 'Ce champ est obligatoire' };
    } else if (license && license.toString().length !== 12) {
        errors = { ...errors, license: 'Code de vérification incorrect au format 000000000000' }
    }

    if (!day || !month || !year) {
        errors = { ...errors, birthDate: 'Veuillez remplir ce champ au format JJ/MM/AAAA' }
    }

    if (!category) {
        errors = { ...errors, category: 'Ce champ est obligatoire' }
    }
    return errors;
}