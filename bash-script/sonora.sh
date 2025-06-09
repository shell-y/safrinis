#!/bin/bash

# conferindo se usuário não é root
if [ "$EUID" -ne 0 ]; then
    # EUID -> var com id do usuário atual
    # -ne -> not equals (somente usado para números)
    # 0 é o id do root

    echo -e 'Esse script só pode ser executado pelo superusuário.\nUse sudo ou troque com su root para continuar a execução.'
    exit
fi

# essa função será chamada quando o `trap` receber o sinal ERR
detectar_erro () {
    log "Ocorreu um erro durante a execução: $1"
    upload_log 'false' # vai impedir a interrupção da instância
}

trap 'detectar_erro' ERR

interromper_ec2=$( [ "$1" = '--stop' ] && echo 'true' || echo 'false' ) # parâmetro ao executar o script

arq_log="./logs/log_$(TZ='America/Sao_Paulo' date '+%d_%m_%Y_%H_%M_%S').txt"
touch "$arq_log"

log () {
    local hora=$(TZ='America/Sao_Paulo' date '+%T')
    echo -e "[$hora] $1" >> $arq_log
}

upload_log () {
    log 'Conferindo parâmetro de interrompimento...'
    if [ "$interromper_ec2" = 'true' ]; then
        if [ $1 != 'false' ]; then
            log 'Após o upload, a instância será interrompida'
            interrupcao_confirmada='true'
        else 
            log 'Por conta do erro a interrupção da instância foi cancelada.'
        fi 
    else
        log 'Instância não será interrompida'
    fi

    log 'Enviando log para o Bucket S3...'
    local tentativa_upload=$(aws s3 cp "$arq_log" s3://s3-safrinis)

    if echo "$tentativa_upload" | grep -q 'upload:'; then
        log 'Upload efetuado com sucesso'

        if [ "$interrupcao_confirmada" = 'true' ]; then
            log 'Encerrando atual instância EC2...'
            # aws ec2 stop-instances --instance-ids <ID>
        fi

    else
        log "Ocorreu um erro: $tentativa_upload"
    fi

    exit
}

log 'Início do script para execução dos containers Sonora!'

log 'Executando container sonora-python, para coleta de dados...'
docker run --rm sonora-python
log 'Concluído com sucesso.'

log 'Executando container sonora-java, para tratamento e armazenamento dos dados...'
docker run --rm sonora-java
log 'Concluído com sucesso.'

log 'Fim do processo de coleta e tratamento.'

upload_log
