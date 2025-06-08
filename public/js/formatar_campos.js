function formatCNPJ(value) {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    return value;
}

function formatCelular(value) {
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
}

document.getElementById("cnpj").addEventListener("input", (e) => {
    e.target.value = formatCNPJ(e.target.value);
});

document.getElementById("celular").addEventListener("input", (e) => {
    e.target.value = formatCelular(e.target.value);
});

function formatarParaEnvio(str) {
    var novaStr = "";
    const caracteresIndesejados = "./-() ";

    for (let char of str) {
        if (!caracteresIndesejados.includes(char)) {
            novaStr += char;
        }
    }

    return novaStr;
}

export { formatCNPJ, formatCelular, formatarParaEnvio };
