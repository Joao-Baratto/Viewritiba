# Viewritiba

Plataforma web para divulgar, descobrir e gerenciar eventos presenciais em Curitiba e Região Metropolitana. O projeto conecta organizadores e participantes e oferece recursos de descoberta, interação e moderação de eventos.

## Funcionalidades

### Organizadores
- Cadastro e login de organizadores.
- Painel para gerenciar os próprios eventos.
- Criação e edição de eventos com título, descrição, data, local e categorias.
- Perfil do organizador, edição de dados e alteração de senha com validação da senha atual.

### Participantes
- Cadastro, login e gerenciamento de perfil.
- Exploração de eventos, com filtros por categoria e visualização de detalhes.
- Comentários em eventos.
- Favoritos com observações e lista de eventos compartilhados com o participante.

### Moderação
- Login separado para moderadores.
- Gerenciamento de categorias.
- Remoção de eventos e comentários.
- Suspensão e reativação de contas de organizadores e participantes, com motivo da suspensão.

## Tecnologias

- HTML, CSS e JavaScript (Vanilla), com requisições assíncronas usando Fetch API.
- PHP e sessões para os endpoints e controle de acesso.
- MySQL/MariaDB com `mysqli`.
- Apache (por exemplo, XAMPP).

## Estrutura do projeto

```text
ViewRitiba/
├── compartilhamento_eventos/  # Compartilhamento e lista de eventos recebidos
├── crud_admin/                # Login, painel e endpoints de moderação
├── crud_comentarios/          # Telas e endpoints de comentários
├── crud_evento/               # Cadastro, consulta e gestão de eventos
├── crud_organizador/          # Cadastro, perfil e painel do organizador
├── crud_participante/         # Cadastro, perfil e recursos do participante
├── favoritos/                 # Favoritos de eventos
├── css/                       # Estilos compartilhados
├── php/                       # Endpoints compartilhados
├── index.html                 # Entrada da aplicação
└── README.md
```

## Executar localmente

### Requisitos

- PHP 8 ou superior com a extensão `mysqli`.
- MySQL ou MariaDB.
- Apache com suporte a PHP (XAMPP recomendado).

### Configuração

1. Coloque o projeto na pasta pública do servidor. No XAMPP, por exemplo:

   ```text
   C:\xampp\htdocs\ViewRitiba
   ```

2. Inicie Apache e MySQL pelo painel do XAMPP.

3. Crie o banco `viewritiba` e configure as credenciais nos arquivos `conexao.php` dos módulos:

   ```php
   $servidor = 'localhost';
   $usuario = 'root';
   $senha = '';
   $banco = 'viewritiba';
   ```

4. Acesse `http://localhost/ViewRitiba/`. A página inicial redireciona para o menu principal.

### Banco de dados: atenção

Os scripts SQL disponíveis em `crud_organizador/sql/`, `crud_participante/sql/` e `crud_evento/sql/` criam apenas parte das tabelas do sistema. Eles não constituem uma instalação completa do banco para todos os recursos da versão atual: tabelas utilizadas por categorias, comentários, favoritos e compartilhamentos também são necessárias. Não há, neste repositório, um script único de migração que crie todo o esquema atual. Portanto, importar somente esses arquivos não garante que todas as telas e funcionalidades estejam prontas para uso.

## Acesso do moderador

O moderador usa credenciais configuradas no ambiente do Apache, não contas de organizador ou participante. No XAMPP, defina as variáveis no arquivo `C:\xampp\apache\conf\extra\httpd-xampp.conf`:

```apache
SetEnv VIEWRITIBA_MODERATOR_USER "seu-usuario-de-moderacao"
SetEnv VIEWRITIBA_MODERATOR_PASSWORD_HASH "hash-gerado-com-password_hash"
```

Gere o hash localmente com o PHP do XAMPP (o comando solicita a senha sem colocá-la no histórico como argumento):

```powershell
& C:\xampp\php\php.exe -r "fwrite(STDERR, 'Senha: '); echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
```

Configure o hash resultante, reinicie o Apache e acesse `http://localhost/ViewRitiba/crud_admin/login.html`. Mantenha as credenciais fora do repositório.

## Páginas principais

| Caminho | Descrição |
| --- | --- |
| `/` | Entrada que redireciona para o menu principal |
| `/crud_organizador/home/MainMenu.html` | Menu inicial |
| `/crud_organizador/login/Login.html` | Login do organizador |
| `/crud_organizador/home/painel.html` | Painel do organizador |
| `/crud_evento/home/eventos.html` | Eventos do organizador |
| `/crud_evento/home/catalogo.html` | Catálogo de eventos |
| `/crud_participante/home/painel.html` | Painel do participante |
| `/crud_participante/home/explorar.html` | Exploração de eventos |
| `/favoritos/favoritos.html` | Eventos favoritos |
| `/compartilhamento_eventos/compartilhamento.html` | Eventos compartilhados com o participante |
| `/crud_admin/login.html` | Login privado do moderador |
| `/crud_admin/painel.php` | Painel privado de moderação |

## Notas de segurança

- As operações de acesso restrito dependem de sessões PHP no servidor.
- O ID do organizador que publica eventos é obtido da sessão, não de um valor enviado pelo navegador.
- As senhas de contas devem ser armazenadas com hash (`password_hash`) e verificadas com `password_verify`.
- Credenciais do moderador devem ser configuradas fora do código versionado.
- Ao publicar a aplicação, configure o banco e o servidor para o ambiente de produção; as credenciais padrão mostradas acima são apenas um exemplo de desenvolvimento local.
