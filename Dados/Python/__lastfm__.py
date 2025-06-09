import pandas as pd
import requests
import logging
from datetime import datetime
import os
import boto3
from io import BytesIO
import time
from dotenv import load_dotenv


load_dotenv()
# Configurações
LASTFM_API_KEY = os.getenv('LASTFM_API_KEY')
BUCKET_NAME = os.getenv('BUCKET_NAME')
S3_FILE_KEY = os.getenv('S3_FILE_KEY_2')

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_SESSION_TOKEN = os.getenv('AWS_SESSION_TOKEN')

# Logging
log_folder = "logs"
os.makedirs(log_folder, exist_ok=True)
log_path = os.path.join(log_folder, "lastfm_scraper.log")

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
    "Bruno Mars", "Ne-Yo", "Sean Kingston", "Justin Timberlake", "Justin Bieber",
    "Usher", "Maroon 5","The Weeknd", "Akon", "Zayn", "Lady Gaga",
    "Beyoncé", "Dua Lipa", "Madonna", "Britney Spears", "Kylie Minogue",
    "Miley Cyrus", "Taylor Swift", "Ariana Grande", "Katy Perry",
    "Sabrina Carpenter", "Thiaguinho", "Péricles", "Arlindo Cruz", "Ferrugem",
    "Grupo Menos é Mais", "Sorriso Maroto", "Zeca Pagodinho", "Pixote",
    "Grupo Revelação", "Turma do Pagode", "Belo"
]

def get_artist_info(artist_name):
    logging.info(f'[INFO] Buscando dados para: "{artist_name}"')
    url = 'http://ws.audioscrobbler.com/2.0/'
    params = {
        'method': 'artist.getinfo',
        'artist': artist_name,
        'api_key': LASTFM_API_KEY,
        'format': 'json'
    }

    while True:
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 5))
                logging.warning(f'[INFO] API bloqueou requisição (429). Aguardando {wait_time} segundos...')
                time.sleep(wait_time)
            else:
                response.raise_for_status()
                break
        except requests.exceptions.Timeout:
            logging.error(f'[INFO] Timeout ao buscar dados para "{artist_name}"')
            return None
        except Exception as e:
            logging.error(f'[INFO] Erro ao buscar dados para "{artist_name}": {e}')
            return None

    data = response.json().get('artist')
    if not data:
        logging.warning(f'[INFO] Dados não encontrados para: "{artist_name}"')
        return None

    logging.info(f'[INFO] Dados encontrados para: "{artist_name}"')
    return data

def save_artists_with_pandas(artists_data):
    logging.info('[EXCEL] Salvando artistas em planilha Excel com Pandas')

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
        logging.info(f'[EXCEL] Arquivo Excel encontrado no S3. Carregando dados existentes ({len(existing_df)} registros).')
    except s3.exceptions.NoSuchKey:
        logging.info('[EXCEL] Arquivo Excel não encontrado no S3. Criando novo arquivo.')
        existing_df = pd.DataFrame()  # vazio
    except Exception as e:
        logging.error(f'[EXCEL] Erro ao carregar arquivo Excel do S3: {e}')
        existing_df = pd.DataFrame()  # vazio

    new_data = []
    for artist in artists_data:
        artist_id = artist.get('mbid') if artist.get('mbid') else artist.get('name')
        nome = artist.get('name')
        ouvintes = int(artist.get('stats', {}).get('listeners', 0))
        total_plays = int(artist.get('stats', {}).get('playcount', 0))
        ontour = int(artist.get('ontour', 0))  # já 0 ou 1 na API

        # Busca última coleta para esse artista no dataframe existente (pelo ID)
        plays_hoje = 0
        if not existing_df.empty:
            df_artist = existing_df[existing_df['ID'] == artist_id]
            if not df_artist.empty:
                # Pega o último registro (última data)
                ultimo_total_plays = df_artist.sort_values('Data da Requisição', ascending=False).iloc[0]['TotalPlays']
                plays_hoje = total_plays - int(ultimo_total_plays)
                if plays_hoje < 0:
                    plays_hoje = 0  # para evitar valor negativo

        new_data.append({
            'ID': artist_id,
            'Nome': nome,
            'Ouvintes': ouvintes,
            'Plays': plays_hoje,
            'TotalPlays': total_plays,
            'OnTour': ontour,
            'Data da Requisição': current_date
        })

    new_df = pd.DataFrame(new_data)

    combined_df = pd.concat([existing_df, new_df], ignore_index=True)
    combined_df.drop_duplicates(subset=['ID', 'Data da Requisição'], inplace=True)

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
    logging.info('[MAIN] Iniciando processo de coleta de dados na Last.fm...')

    if check_already_collected_today():
        return

    collected_artists = []

    for artist_name in artists_list:
        artist_info = get_artist_info(artist_name)
        if artist_info is None:
            continue
        collected_artists.append(artist_info)

    save_artists_with_pandas(collected_artists)
    logging.info('[MAIN] Processo finalizado com sucesso!')

if __name__ == '__main__':
    main()
