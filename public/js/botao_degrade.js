/* 
    infelizmente não é possível recriar o botão presente no protótipo só com CSS. 
    esse .js serve então para suprir essa necessidade, e deve ser importado à todas as páginas que precisarem do tal botão!
*/

const botoes = document.querySelectorAll('button.degrade');

botoes.forEach(botao => {
    const conteudoBotao = botao.innerHTML
    botao.setAttribute('inner-text', conteudoBotao)
});