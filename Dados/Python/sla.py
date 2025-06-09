from telethon import TelegramClient
from telethon.tl.functions.messages import ExportChatInviteRequest

api_id = 1234567
api_hash = 'your_api_hash'

client = TelegramClient('session_name', api_id, api_hash)

async def main():
    chat = None

    # Procurar o grupo pelo nome
    async for dialog in client.iter_dialogs():
        if dialog.is_group and dialog.name == 'Grupo Automático':
            chat = dialog
            break

    if chat:
        result = await client(ExportChatInviteRequest(chat.id))
        print(f'✅ Link de convite: {result.link}')
    else:
        print('❌ Grupo não encontrado.')

with client:
    client.loop.run_until_complete(main())
