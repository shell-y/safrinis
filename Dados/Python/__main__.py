import pandas as pd
import requests
import base64
import logging
from datetime import datetime
import os
import boto3
from io import BytesIO
import time
from dotenv import load_dotenv


load_dotenv()
# Configurações
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
S3_FILE_KEY = os.getenv('S3_FILE_KEY')

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_SESSION_TOKEN = os.getenv('AWS_SESSION_TOKEN')

# Logging
log_folder = "logs"
os.makedirs(log_folder, exist_ok=True)  
log_path = os.path.join(log_folder, "spotify_scraper.log")

class ColorFormatter(logging.Formatter):
    COLORS = {
        logging.DEBUG: "\033[94m",
        logging.INFO: "\033[92m",
        logging.WARNING: "\033[93m",
        logging.ERROR: "\033[91m",
        logging.CRITICAL: "\033[1;91m"
    }

    def format(self, record):
        color = self.COLORS.get(record.levelno, "\033[0m")
        reset = "\033[0m"
        message = super().format(record)
        return f"{color}{message}{reset}"

log_format = "[%(asctime)s] [%(levelname)s] %(message)s"
date_format = "%d/%m/%Y %H:%M:%S"

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(ColorFormatter(log_format, date_format))

file_handler = logging.FileHandler(log_path)
file_handler.setFormatter(logging.Formatter(log_format, date_format))

logging.basicConfig(
    level=logging.INFO,
    handlers=[stream_handler, file_handler]
)

# Lista de artistas
artists_list = [
    "BrunoMars","Neyo","SeanKingston","JustinTimberlake","JustinBieber","Usher","Maroon5",
    "TheWeeknd","Akon","Zayn","LadyGaga","Beyonce","DuaLipa","Madonna","BritneySpears",
    "KylieMinogue","MileyCyrus","TaylorSwift","ArianaGrande","KatyPerry","SabrinaCarpenter",
    "Thiaguinho","Pericles","ArlindoCruz","Ferrugem","GrupoMenosEMais","SorrisoMaroto",
    "ZecaPagodinho","Pixote","GrupoRevelacao","TurmaDoPagode","Belo"
]

def get_access_token():
    logging.info('[AUTH] Iniciando obtenção do token de acesso...')
    url = 'https://accounts.spotify.com/api/token'
    headers = {
        'Authorization': 'Basic ' + base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode(),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {'grant_type': 'client_credentials'}

    while True:
        try:
            response = requests.post(url, headers=headers, data=data, timeout=10)
            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 5))
                logging.warning(f'[AUTH] API bloqueou requisição (429). Aguardando {wait_time} segundos...')
                time.sleep(wait_time)
            else:
                response.raise_for_status()
                break
        except requests.exceptions.Timeout:
            logging.error('[AUTH] Timeout ao obter token de acesso')
            raise
    logging.info('[AUTH] Token obtido com sucesso.')
    return response.json()['access_token']

def search_artist_id(artist_name, access_token):
    logging.info(f'[SEARCH] Buscando ID para: "{artist_name}"')
    url = 'https://api.spotify.com/v1/search'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': artist_name, 'type': 'artist', 'limit': 1}

    while True:
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 5))
                logging.warning(f'[SEARCH] API bloqueou requisição (429). Aguardando {wait_time} segundos...')
                time.sleep(wait_time)
            else:
                response.raise_for_status()
                break
        except requests.exceptions.Timeout:
            logging.error(f'[SEARCH] Timeout ao buscar ID para "{artist_name}"')
            return None
    items = response.json().get('artists', {}).get('items', [])

    if not items:
        logging.warning(f'[SEARCH] Artista não encontrado: "{artist_name}"')
        return None
    found_artist = items[0]
    logging.info(f'[SEARCH] ID encontrado: {found_artist["id"]}')
    return found_artist

def get_artist_info(artist_id, access_token):
    logging.info(f'[INFO] Detalhes para ID: {artist_id}')
    url = f'https://api.spotify.com/v1/artists/{artist_id}'
    headers = {'Authorization': f'Bearer {access_token}'}

    while True:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 5))
                logging.warning(f'[INFO] API bloqueou requisição (429). Aguardando {wait_time} segundos...')
                time.sleep(wait_time)
            elif response.status_code != 200:
                logging.warning(f'[INFO] Erro ao buscar artista: {response.status_code}')
                return None
            else:
                return response.json()
        except requests.exceptions.Timeout:
            logging.error(f'[INFO] Timeout ao buscar detalhes para ID: {artist_id}')
            return None

def save_artists_with_pandas(artists_data):
    logging.info('[EXCEL] Salvando artistas em planilha Excel com Pandas')

    current_date = datetime.now().strftime('%d/%m/%Y')

    new_data = [{
        'ID': artist['id'],
        'Nome': artist['name'],
        'Popularidade': artist['popularity'],
        'Seguidores': artist['followers'],
        'Data da Requisição': current_date
    } for artist in artists_data]

    new_df = pd.DataFrame(new_data)

    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        aws_session_token=AWS_SESSION_TOKEN
    )

    try:
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=S3_FILE_KEY)
        existing_df = pd.read_excel(BytesIO(obj['Body'].read()))
        logging.info(f'[EXCEL] Arquivo Excel encontrado no S3. Carregando dados existentes ({len(existing_df)} registros).')

        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        combined_df.drop_duplicates(subset=['ID', 'Data da Requisição'], inplace=True)
    except s3.exceptions.NoSuchKey:
        logging.info('[EXCEL] Arquivo Excel não encontrado no S3. Criando novo arquivo.')
        combined_df = new_df
    except Exception as e:
        logging.error(f'[EXCEL] Erro ao carregar arquivo Excel do S3: {e}')
        combined_df = new_df

    buffer = BytesIO()
    combined_df.to_excel(buffer, index=False)
    buffer.seek(0)
    s3.put_object(Bucket=BUCKET_NAME, Key=S3_FILE_KEY, Body=buffer.getvalue())

    logging.info(f'[EXCEL] Salvamento concluído. Total de registros: {len(combined_df)}')

def check_already_collected_today():
    logging.info('[CHECK] Verificando se já houve coleta hoje...')
    current_date = datetime.now().strftime('%d/%m/%Y')

    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        aws_session_token=AWS_SESSION_TOKEN
    )

    try:
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=S3_FILE_KEY)
        existing_df = pd.read_excel(BytesIO(obj['Body'].read()))

        if current_date in existing_df['Data da Requisição'].values:
            logging.warning(f'[CHECK] Já existe coleta para hoje ({current_date}). Encerrando o processo.')
            return True
        else:
            logging.info('[CHECK] Nenhum dado coletado hoje. Prosseguindo...')
            return False
    except s3.exceptions.NoSuchKey:
        logging.info('[CHECK] Arquivo Excel não encontrado no S3. Prosseguindo...')
        return False
    except Exception as e:
        logging.error(f'[CHECK] Erro ao verificar arquivo Excel do S3: {e}')
        return False

def main():
    logging.info('[MAIN] Iniciando processo de coleta de dados...')

    if check_already_collected_today():
        return

    access_token = get_access_token()
    collected_artists = []

    for artist_name in artists_list:
        artist = search_artist_id(artist_name, access_token)
        if artist is None:
            continue

        artist_info = get_artist_info(artist['id'], access_token)
        if artist_info is None:
            continue

        artist_data = {
            'id': artist_info['id'],
            'name': artist_info['name'],
            'popularity': artist_info.get('popularity', 0),
            'followers': artist_info.get('followers', {}).get('total', 0)
        }

        collected_artists.append(artist_data)

    save_artists_with_pandas(collected_artists)
    logging.info('[MAIN] Processo finalizado com sucesso!')

if __name__ == '__main__':
    main()
