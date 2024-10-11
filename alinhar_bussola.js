function applyButtonActions(){
    const buttons = document.querySelectorAll('.alinhar-bussola');

    const bussola = document.querySelector('#bussolo-alinhar');

    for(let button of buttons){
        button.addEventListener('click', ()=>{
            const action = button.dataset.action;

            if(!bussola.dataset.firstPosition && action == 'marcar'){
                bussola.dataset.firstPosition = bussola.dataset.deg;
            } else if (bussola.dataset.firstPosition && action == 'marcar'){
                bussola.dataset.secondPosition = bussola.dataset.deg;
            } else if (action == 'reset'){
                bussola.dataset.firstPosition = '';
                bussola.dataset.secondPosition = '';
            } else if (action == 'finalizar') {
                let first_position  = bussola.dataset.firstPosition;
                first_position = first_position < 0 ? first_position * -1 : first_position;
                let second_position = bussola.dataset.secondPosition;
                second_position = second_position < 0 ? second_position * -1 : second_position;

                const deg = first_position - second_position
                salvarDesvio(deg);
            }
        });
    }
}

function definirAgulacaoBussula(deg){
    const bussola = document.querySelector('#bussolo-alinhar');

    bussola.dataset.deg = deg;
}

function salvarDesvio(deg){
    localStorage.setItem('desvio', deg);
}

function lerDesvio(){
    return localStorage.getItem('desvio');
}